# Setting up for development

<details>
  <summary>Setup LXD - Linux (with snap)</summary>
  <br/>
  <pre><code>snap install lxd
lxd init # can accept all defaults
lxc config set core.https_address "[::]:8443"</code></pre>
</details>

<details>
  <summary>Setup LXD - Mac</summary>
  <br/>

  > :warning: **VM instances cannot be created with LXC + Multipass on a Mac**. Nested virtualization is unsupported.

  First, if you have not already, you need to install [Homebrew](https://brew.sh/).

  Then install LXC client with brew:

  <pre><code>brew install lxc</code></pre>

  LXD cannot run natively on a Mac, so you need to connect LXC to a remote LXD server. You can set up one inside a Multipass instance. [How to install Multipass on macOS - Using brew](https://multipass.run/docs/installing-on-macos#heading--use-brew)

  Once you have LXC and Multipass installed, we can create a Multipass instance where we will run the LXD daemon:

  <pre><code># launch a new instance called "lxd" with 2 CPUs, 4G memory, and 50G of disk space - gauge these values as you prefer
multipass launch -n lxd -c 2 -m 4G -d 50G</code></pre>

  If you get the `Launched: lxd` output, it means that the command succeeded. We can now launch a shell into the newly created instance:

  <pre><code>multipass shell lxd</code></pre>

  You should be greeted with the Ubuntu shell login message `Welcome to Ubuntu ...`. Make sure the latest version of LXD is installed:

  <pre><code>sudo snap refresh lxd --channel=latest/stable</code></pre>

  This command will either output `snap "lxd" has no updates available` or update lxd to the latest stable version.

  Initialise LXD - replace `your-password` with a password of your choice - and then close the multipass shell:

  <pre><code>sudo lxd init --auto --trust-password your-password --network-address '[::]'
exit</code></pre>

  Connect the LXD server in Multipass to the local LXC. In a terminal on your Mac, run:

  <pre><code>lxc remote add default $(multipass info lxd | grep IPv4 | awk '{print $2}') --password your-password --accept-certificate</code></pre>

  (replace `your-password` with the password you selected before)

  You should get a message saying: `Client certificate now trusted by server: default`

  Switch the remote to the `default` server that we have just added:

  <pre><code>lxc remote switch default</code></pre>

  Launch an instance with the lxc command on your Mac:

  <pre><code>lxc launch ubuntu:jammy test-jammy</code></pre>

  If this succeeds, the setup of LXC and LXD is complete. Finally, expose the API on port 8443:

  <pre><code>lxc config set core.https_address "[::]:8443"</code></pre>
</details>

Install dotrun as described in https://github.com/canonical/dotrun#installation Launch it from the head of this repo

    dotrun

You should enable a firewall as `dotrun` exposes an api to start or interact with unprivileged containers on your public
ip via port `8407`. Ensure that the lxd API on port `8443` is open, so `dotrun` can access it.

The first time, running `dotrun` will generate certificates for you. You can find them in the `keys` folder on the top level of
the repo. Trust them from your local `lxc` with

    sudo lxc config trust add keys/lxd-ui.crt

If you are on a Mac and running LXD inside Multipass, set the `LXD_UI_BACKEND_IP` in the `.env.local` file:

    echo "LXD_UI_BACKEND_IP=$(multipass info lxd | grep IPv4 | awk '{print $2}')" > .env.local

Now you can open https://localhost:8407/ to reach lxd-ui.

To enable pre-commit checks, after the first successful run of `dotrun`, execute `yarn hooks-add`. To remove them, run `yarn hooks-remove`.

# End-to-end tests

Install playwright and its browsers

    npx playwright install

The tests expect the environment on localhost to be accessible. Execute `dotrun` and start tests with

    npx playwright test

Generate new tests with helper

    npx playwright codegen --ignore-https-errors https://localhost:8407/

# Advanced setup

Learn how to 
- [Setup local LXD cluster](https://github.com/canonical/lxd-ui/wiki/Setup-local-LXD-cluster) inside LXD to enable clustering features
- [Setup oidc login](https://github.com/canonical/lxd-ui/wiki/Setup-oidc-login) to enable SSO authentication

