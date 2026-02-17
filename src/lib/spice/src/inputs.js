"use strict";
/*
   Copyright (C) 2012 by Jeremy P. White <jwhite@codeweavers.com>

   This file is part of spice-html5.

   spice-html5 is free software: you can redistribute it and/or modify
   it under the terms of the GNU Lesser General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   spice-html5 is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Lesser General Public License for more details.

   You should have received a copy of the GNU Lesser General Public License
   along with spice-html5.  If not, see <http://www.gnu.org/licenses/>.
*/

import * as Messages from './spicemsg.js';
import { Constants } from './enums.js';
import { KeyNames } from './atKeynames.js';
import { SpiceConn } from './spiceconn.js';
import { DEBUG } from './utils.js';

/*----------------------------------------------------------------------------
 ** Modifier Keystates
 **     These need to be tracked because focus in and out can get the keyboard
 **     out of sync.
 **------------------------------------------------------------------------*/
var Shift_state = -1;
var Ctrl_state = false;
var Alt_state = false;
var Meta_state = -1;

var Alt_locked = false;
var Ctrl_locked = false;


/*----------------------------------------------------------------------------
**  SpiceInputsConn
**      Drive the Spice Inputs channel (e.g. mouse + keyboard)
**--------------------------------------------------------------------------*/
function SpiceInputsConn()
{
    SpiceConn.apply(this, arguments);

    this.mousex = undefined;
    this.mousey = undefined;
    this.button_state = 0;
    this.waiting_for_ack = 0;
}

SpiceInputsConn.prototype = Object.create(SpiceConn.prototype);
SpiceInputsConn.prototype.process_channel_message = function(msg)
{
    if (msg.type == Constants.SPICE_MSG_INPUTS_INIT)
    {
        var inputs_init = new Messages.SpiceMsgInputsInit(msg.data);
        this.keyboard_modifiers = inputs_init.keyboard_modifiers;
        DEBUG > 1 && console.log("MsgInputsInit - modifier " + this.keyboard_modifiers);
        // FIXME - We don't do anything with the keyboard modifiers...
        return true;
    }
    if (msg.type == Constants.SPICE_MSG_INPUTS_KEY_MODIFIERS)
    {
        var key = new Messages.SpiceMsgInputsKeyModifiers(msg.data);
        this.keyboard_modifiers = key.keyboard_modifiers;
        DEBUG > 1 && console.log("MsgInputsKeyModifiers - modifier " + this.keyboard_modifiers);
        // FIXME - We don't do anything with the keyboard modifiers...
        return true;
    }
    if (msg.type == Constants.SPICE_MSG_INPUTS_MOUSE_MOTION_ACK)
    {
        DEBUG > 1 && console.log("mouse motion ack");
        this.waiting_for_ack -= Constants.SPICE_INPUT_MOTION_ACK_BUNCH;
        return true;
    }
    return false;
}



function handle_mousemove(e)
{
    var msg = new Messages.SpiceMiniData();
    var move;
    if (this.sc.mouse_mode == Constants.SPICE_MOUSE_MODE_CLIENT)
    {
        move = new Messages.SpiceMsgcMousePosition(this.sc, e)
        msg.build_msg(Constants.SPICE_MSGC_INPUTS_MOUSE_POSITION, move);
    }
    else
    {
        move = new Messages.SpiceMsgcMouseMotion(this.sc, e)
        msg.build_msg(Constants.SPICE_MSGC_INPUTS_MOUSE_MOTION, move);
    }
    if (this.sc && this.sc.inputs && this.sc.inputs.state === "ready")
    {
        if (this.sc.inputs.waiting_for_ack < (2 * Constants.SPICE_INPUT_MOTION_ACK_BUNCH))
        {
            this.sc.inputs.send_msg(msg);
            this.sc.inputs.waiting_for_ack++;
        }
        else
        {
            DEBUG > 0 && this.sc.log_info("Discarding mouse motion");
        }
    }

    if (this.sc && this.sc.cursor && this.sc.cursor.spice_simulated_cursor)
    {
        this.sc.cursor.spice_simulated_cursor.style.display = 'block';
        this.sc.cursor.spice_simulated_cursor.style.left = e.pageX - this.sc.cursor.spice_simulated_cursor.spice_hot_x + 'px';
        this.sc.cursor.spice_simulated_cursor.style.top = e.pageY - this.sc.cursor.spice_simulated_cursor.spice_hot_y + 'px';
        e.preventDefault();
    }

}

function handle_mousedown(e)
{
    var press = new Messages.SpiceMsgcMousePress(this.sc, e)
    var msg = new Messages.SpiceMiniData();
    msg.build_msg(Constants.SPICE_MSGC_INPUTS_MOUSE_PRESS, press);
    if (this.sc && this.sc.inputs && this.sc.inputs.state === "ready")
        this.sc.inputs.send_msg(msg);

    e.preventDefault();
}

function handle_contextmenu(e)
{
    e.preventDefault();
    return false;
}

function handle_mouseup(e)
{
    var release = new Messages.SpiceMsgcMouseRelease(this.sc, e)
    var msg = new Messages.SpiceMiniData();
    msg.build_msg(Constants.SPICE_MSGC_INPUTS_MOUSE_RELEASE, release);
    if (this.sc && this.sc.inputs && this.sc.inputs.state === "ready")
        this.sc.inputs.send_msg(msg);

    e.preventDefault();
}

function handle_mousewheel(e)
{
    var press = new Messages.SpiceMsgcMousePress;
    var release = new Messages.SpiceMsgcMouseRelease;
    if (e.deltaY < 0)
        press.button = release.button = Constants.SPICE_MOUSE_BUTTON_UP;
    else
        press.button = release.button = Constants.SPICE_MOUSE_BUTTON_DOWN;
    press.buttons_state = 0;
    release.buttons_state = 0;

    var msg = new Messages.SpiceMiniData();
    msg.build_msg(Constants.SPICE_MSGC_INPUTS_MOUSE_PRESS, press);
    if (this.sc && this.sc.inputs && this.sc.inputs.state === "ready")
        this.sc.inputs.send_msg(msg);

    msg.build_msg(Constants.SPICE_MSGC_INPUTS_MOUSE_RELEASE, release);
    if (this.sc && this.sc.inputs && this.sc.inputs.state === "ready")
        this.sc.inputs.send_msg(msg);

    e.preventDefault();

    window.dispatchEvent(new CustomEvent("spice-wheel", { detail: { wheelEvent: e } }));
}

function handle_keydown(e)
{
    var key = new Messages.SpiceMsgcKeyDown(e)
    var msg = new Messages.SpiceMiniData();
    check_and_update_modifiers(e, key.code, this.sc);
    msg.build_msg(Constants.SPICE_MSGC_INPUTS_KEY_DOWN, key);
    if (this.sc && this.sc.inputs && this.sc.inputs.state === "ready")
        this.sc.inputs.send_msg(msg);

    e.preventDefault();
}

function handle_keyup(e)
{
    var key = new Messages.SpiceMsgcKeyUp(e)
    var msg = new Messages.SpiceMiniData();
    check_and_update_modifiers(e, key.code, this.sc);
    msg.build_msg(Constants.SPICE_MSGC_INPUTS_KEY_UP, key);
    if (this.sc && this.sc.inputs && this.sc.inputs.state === "ready")
        this.sc.inputs.send_msg(msg);

    e.preventDefault();
}

function send_key(sc, keyCode)
{
    var msg = new Messages.SpiceMiniData();
    var key = new Messages.SpiceMsgcKeyDown();

    key.code = keyCode;
    msg.build_msg(Constants.SPICE_MSGC_INPUTS_KEY_DOWN, key);
    sc.inputs.send_msg(msg);

    key.code = 0x80|keyCode;
    msg.build_msg(Constants.SPICE_MSGC_INPUTS_KEY_UP, key);
    sc.inputs.send_msg(msg);
}

function sendCtrlAltDel(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        update_modifier(true, KeyNames.KEY_LCtrl, sc);
        Ctrl_state = true;
        Ctrl_locked = false;
        update_modifier(true, KeyNames.KEY_Alt, sc);
        Alt_state = true;
        Alt_locked = false;
        send_key(sc, KeyNames.KEY_Delete);
        const release = () => {
            update_modifier(false, KeyNames.KEY_LCtrl, sc);
            Ctrl_state = false;
            update_modifier(false, KeyNames.KEY_Alt, sc);
            Alt_state = false;
        }
        setTimeout(release, 100);
    }
}

function sendAltF4(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        update_modifier(true, KeyNames.KEY_Alt, sc);
        Alt_state = true;
        Alt_locked = false;
        update_modifier(false, KeyNames.KEY_LCtrl, sc);
        Ctrl_state = false;
        Ctrl_locked = false;
        send_key(sc, KeyNames.KEY_F4);
        const release = () => {
            update_modifier(false, KeyNames.KEY_Alt, sc);
            Alt_state = false;
        }
        setTimeout(release, 100);
    }
}

function sendAltTab(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        update_modifier(true, KeyNames.KEY_Alt, sc);
        Alt_state = true;
        Alt_locked = false;
        update_modifier(false, KeyNames.KEY_LCtrl, sc);
        Ctrl_state = false;
        Ctrl_locked = false;
        send_key(sc, KeyNames.KEY_Tab);
        const release = () => {
            update_modifier(false, KeyNames.KEY_Alt, sc);
            Alt_state = false;
        }
        setTimeout(release, 100);
    }
}

function sendF1(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        send_key(sc, KeyNames.KEY_F1);
    }
}

function sendF2(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        send_key(sc, KeyNames.KEY_F2);
    }
}

function sendF3(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        send_key(sc, KeyNames.KEY_F3);
    }
}

function sendF4(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        send_key(sc, KeyNames.KEY_F4);
    }
}

function sendF5(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        send_key(sc, KeyNames.KEY_F5);
    }
}

function sendF6(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        send_key(sc, KeyNames.KEY_F6);
    }
}

function sendF7(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        send_key(sc, KeyNames.KEY_F7);
    }
}

function sendF8(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        send_key(sc, KeyNames.KEY_F8);
    }
}

function sendF9(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        send_key(sc, KeyNames.KEY_F9);
    }
}

function sendF10(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        send_key(sc, KeyNames.KEY_F10);
    }
}

function sendF11(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        send_key(sc, KeyNames.KEY_F11);
    }
}

function sendF12(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        send_key(sc, KeyNames.KEY_F12);
    }
}

function sendPrintScreen(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        send_key(sc, KeyNames.KEY_PrintScreen);
    }
}

function toggleAlt(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        Alt_state = !Alt_state;
        Alt_locked = !Alt_locked;
        update_modifier(Alt_state, KeyNames.KEY_Alt, sc);
    }
}

function isAltPressed()
{
    return Alt_state === true;
}

function toggleCtrl(sc)
{
    if (sc && sc.inputs && sc.inputs.state === "ready"){
        Ctrl_state = !Ctrl_state;
        Ctrl_locked = !Ctrl_locked;
        update_modifier(Ctrl_state, KeyNames.KEY_LCtrl, sc);
    }
}

function isCtrlPressed()
{
    return Ctrl_state === true;
}

function update_modifier(state, code, sc)
{
    var msg = new Messages.SpiceMiniData();
    if (!state)
    {
        var key = new Messages.SpiceMsgcKeyUp()
        key.code =(0x80|code);
        msg.build_msg(Constants.SPICE_MSGC_INPUTS_KEY_UP, key);
    }
    else
    {
        var key = new Messages.SpiceMsgcKeyDown()
        key.code = code;
        msg.build_msg(Constants.SPICE_MSGC_INPUTS_KEY_DOWN, key);
    }

    sc.inputs.send_msg(msg);
}

function check_and_update_modifiers(e, code, sc)
{
    if (Shift_state === -1)
    {
        Shift_state = e.shiftKey;
        if (!Ctrl_locked) {
            Ctrl_state = e.ctrlKey;
        }
        if (!Alt_locked) {
            Alt_state = e.altKey;
        }
        Meta_state = e.metaKey;
    }

    if (code === KeyNames.KEY_ShiftL)
        Shift_state = true;
    else if (code === KeyNames.KEY_Alt) {
        Alt_state = true;
        Alt_locked = false;
    }
    else if (code === KeyNames.KEY_LCtrl) {
        Ctrl_state = true;
        Ctrl_locked = false;
    }
    else if (code === 0xE0B5)
        Meta_state = true;
    else if (code === (0x80|KeyNames.KEY_ShiftL))
        Shift_state = false;
    else if (code === (0x80|KeyNames.KEY_Alt)) {
        Alt_state = false;
        Alt_locked = false;
    }
    else if (code === (0x80|KeyNames.KEY_LCtrl)) {
        Ctrl_state = false;
        Ctrl_locked = false;
    }
    else if (code === (0x80|0xE0B5))
        Meta_state = false;

    if (sc && sc.inputs && sc.inputs.state === "ready")
    {
        if (Shift_state != e.shiftKey)
        {
            console.log("Shift state out of sync");
            update_modifier(e.shiftKey, KeyNames.KEY_ShiftL, sc);
            Shift_state = e.shiftKey;
        }
        if (Alt_state != e.altKey && !Alt_locked)
        {
            console.log("Alt state out of sync");
            update_modifier(e.altKey, KeyNames.KEY_Alt, sc);
            Alt_state = e.altKey;
        }
        if (Ctrl_state != e.ctrlKey && !Ctrl_locked)
        {
            console.log("Ctrl state out of sync");
            update_modifier(e.ctrlKey, KeyNames.KEY_LCtrl, sc);
            Ctrl_state = e.ctrlKey;
        }
        if (Meta_state != e.metaKey)
        {
            console.log("Meta state out of sync");
            update_modifier(e.metaKey, 0xE0B5, sc);
            Meta_state = e.metaKey;
        }
    }
}

export {
  SpiceInputsConn,
  handle_mousemove,
  handle_mousedown,
  handle_contextmenu,
  handle_mouseup,
  handle_mousewheel,
  handle_keydown,
  handle_keyup,
  sendCtrlAltDel,
  sendAltTab,
  sendAltF4,
  sendF1,
  sendF2,
  sendF3,
  sendF4,
  sendF5,
  sendF6,
  sendF7,
  sendF8,
  sendF9,
  sendF10,
  sendF11,
  sendF12,
  sendPrintScreen,
  toggleAlt,
  toggleCtrl,
  isAltPressed,
  isCtrlPressed,
};
