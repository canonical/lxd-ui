# Sending a pull request

1. Fork the repository

2. Clone the fork to your local machine and add the upstream remote:

       git clone https://github.com/<your username>/lxd-ui.git
       cd lxd-ui
       git remote add upstream https://github.com/canonical/lxd-ui.git

   On a Mac, do step 3 first and run these commands inside the Multipass VM, not on your Mac. Inside the VM, your prompt starts with `ubuntu@lxd`.

3. Setup LXD as a backend:
  
     <details>
      <summary>Setup LXD - Linux (with snap)</summary>
      <br/>

       snap install lxd
       lxd init # can accept all defaults
       lxc config set core.https_address "[::]:8443"
    </details>

    <details>
      <summary>Setup LXD - Mac</summary>
      <br/>

      LXD and workshop only run on Linux. On a Mac, you run both inside a Linux VM created with Multipass, and keep the code inside that VM.

      > :warning: **VM instances cannot be created with LXD inside Multipass on a Mac**. Nested virtualization is unsupported.

      Install [Multipass](https://multipass.run/docs/installing-on-macos#heading--use-brew), then create a VM called `lxd` with 2 CPUs, 4G memory and 30G of disk space, and open a shell in it:

       multipass launch 24.04 -n lxd -c 2 -m 4G -d 30G
       multipass shell lxd

      Inside the VM, install LXD, allow the `ubuntu` user to use it, and leave the VM:

       sudo snap install lxd --channel=6/stable
       sudo lxd init --auto
       sudo usermod -aG lxd ubuntu
       exit

      Open a new shell in the VM, so the group change applies, and expose the API on port 8443:

       multipass shell lxd
       lxc config set core.https_address "[::]:8443"

      Run all the following steps inside this VM, including step 2 (clone the fork).
    </details>


4. Install [workshop](https://snapcraft.io/workshop) and launch it from the head of this repo

       sudo snap install workshop --classic
       workshop launch

    This concludes the dev setup. Now you can run the development server with

        workshop run dev serve

    You should enable a firewall as `workshop run dev serve` exposes an api to start or interact with unprivileged containers on your public
    ip via port `8407`. Ensure that the lxd API on port `8443` is open, so `workshop` can access it.

    For local development, the UI is served by the Vite development server, which uses port 8507 by default. 
    If you have another process listening on this port on your system, create `.env.local` as a copy of the `.env` file and change the `VITE_PORT` variable in it to any free port.

    The first time, running `workshop run dev serve` will generate certificates for you. You can find them in the `keys` folder on the top level of the repo. Trust them from your local `lxc` with

       sudo lxc auth identity create tls/workshop-cert keys/lxd-ui.crt --group admins
    
    Workshop reaches LXD through its own network bridge. Set the `LXD_UI_BACKEND_IP` in the `.env.local` file to the address of that bridge, then restart workshop and the dev server:

       echo "LXD_UI_BACKEND_IP=$(lxc network get workshopbr0 ipv4.address | cut -d/ -f1)" >> .env.local
       workshop stop dev
       workshop start dev
       workshop run dev serve

    Now you can open https://localhost:8407/ to reach lxd-ui.

    <details>
      <summary>Open lxd-ui from a Mac</summary>
      <br/>

      The development server runs inside the VM, so forward its port to your Mac first. Add your Mac's SSH public key to the VM. The command below uses `~/.ssh/id_ed25519.pub`: if you use a different key, change the path, and if you have no key yet, create one with `ssh-keygen -t ed25519`:

       multipass exec lxd -- bash -c "echo '$(cat ~/.ssh/id_ed25519.pub)' >> ~/.ssh/authorized_keys"

      Then connect [VS Code Remote - SSH](https://code.visualstudio.com/docs/remote/ssh) to `ubuntu@<vm-ip>` and open the repo folder in the VM. VS Code forwards port 8407 for you. Without VS Code, run this in a terminal on your Mac instead:

       ssh -N -L 8407:localhost:8407 ubuntu@$(multipass info lxd | grep IPv4 | awk '{print $2}')
    </details>


5. To enable pre-commit checks, after the first successful run of `workshop`, execute `yarn hooks-add`. To remove them, run `yarn hooks-remove`.


6. Create a new topic branch:

       git checkout -b my-topic-branch


7. Make changes, commit, and push to your fork:

       git push -u origin HEAD


8. Go to the [repository](https://github.com/canonical/lxd-ui/) and open a pull request.

The team actively monitors for new pull requests. We will review your PR and either merge it, request changes to it, or close it with an explanation.

# Troubleshooting on Mac

- **The UI cannot reach LXD.** Check that `LXD_UI_BACKEND_IP` in `.env.local` is the `workshopbr0` address, not `172.17.0.1`, and that `lxc config get core.https_address` in the VM is `[::]:8443`.
- **Errors about packages for the wrong platform.** The repo was shared from the Mac into the VM. Clone it inside the VM instead, and do not use `multipass mount` for it.
- **`certificate is not valid yet` after the Mac wakes from sleep.** The VM clock is behind. Run `sudo timedatectl set-ntp true` and `sudo systemctl restart systemd-timesyncd` inside the VM.
- **`workshop run dev serve` stops with `i/o timeout`, but the UI still works.** The terminal lost its connection; the server is still running inside the workshop. If you start it again and see `Port 8507 is already in use`, run `workshop stop dev` and `workshop start dev` first.
- **Commit signing fails inside the VM.** Your GPG key is only on the Mac. Import it into the VM, see [Signing off commits](#signing-off-commits).

# License and copyright
All contributors must sign the [Canonical contributor license agreement](https://ubuntu.com/legal/contributors), which gives Canonical permission to use the contributions. The author of a change remains the copyright holder of their code (no copyright assignment).

# Signing off commits
All commits are required to be signed off using a GPG key. You can use the following references to set up your git configurations for commit signing.
1. [Generating a new GPG key](https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key) or [use an existing GPG key](https://docs.github.com/en/authentication/managing-commit-signature-verification/checking-for-existing-gpg-keys). Make sure that the GPG key is associated to the email that you are using within your git configuration. If you have multiple GPG keys set up, you should [tell git about your signing GPG key](https://docs.github.com/en/authentication/managing-commit-signature-verification/telling-git-about-your-signing-key).
2. [Add a GPG key to your Github account](https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-gpg-key-to-your-github-account). This will make your commits verified on Github.
3. To sign commits, you should enter the git command with additional flags as shown in this example: `git commit -s -S -a -m "initial commit"`.
4. To make your life a little easier, you can setup a git alias for signing commits with `git config alias.sc 'commit -s -S -a'`. Now you can sign your commits with `git sc -m "initial commit"` for example. Note this only enables the alias for your local git configuration.

# Code style guidelines
The principles mentioned are guardrails, not a law to abide to. Their application always depends on the circumstances.

## Formatting
We use [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) to maintain a consistent code style. You can check your code formatting with

    yarn lint-js

For CSS formatting, we use [Stylelint](https://stylelint.io/). You can check your CSS formatting with

    yarn lint-scss

For circular dependency checks, we use [dependency-cruiser](https://www.npmjs.com/package/dependency-cruiser). You can run it with

    yarn check-circular-deps

## Naming
When struggling to find a good name, call it "foo" and rename at a later stage. You will gain a better understanding after finishing the implementation. A good name will be much easier to choose with that knowledge.

Avoid taking perspective of only your current use case for the name. Consider the point of view of the component or interface at hand. 

Take time to refine all introduced names on commit or during review.

Learn the shortcuts in your IDE. `Shift + F6` in PyCharm does rename variables, functions and components, including all references, comments, file names.

## Interfaces
When designing components, think carefully about interfaces. Where should the state live, and how is it shared? Prop drilling?

Avoid using the React context API, it is a form of global state and hides dependencies. Also, it makes the data flow hard to understand. Aim to make the dependencies explicit, so they are easy to follow.

## State
- Avoid state.
- Avoid global state.
- Do not expose state.
- Keep state as local as possible.
- Don't use state for calculated values.
- `useQuery` is great at handling API state.
- You can use query parameters to hold filter state to allow for bookmarks.

## Comments
Make code speak so you don't need comments. Clear function and variable names can make code speak.

Introduce constants with good names to explain what they are instead of using the value with no extra semantics. Add comments to explain why, not how. Explain details outside what the code can express with comments.

## Simplification practices
Prefer early exit instead of nesting conditionals.

    // avoid
    function example(a) {
      if (a) {
        // do something
      } else {
        return;
      }
    }

    // prefer
    function example(a) {
      if (!a) {
        return;
      }
      // do something
    }

Use positive if conditions, especially in ternary operators.

    // avoid
    const status = !isOnline ? 'offline' : 'online';

    // prefer
    const status = isOnline ? 'online' : 'offline';

Avoid introducing callbacks when not needed.

    // avoid
    const doSomething = () => { ... }
    return <Button onClick={() => { doSomething(); }}>

    // prefer
    const doSomething = () => { ... }
    return <Button onClick={doSomething}>

Simplify string props when they are static.

    // avoid
    <Component foo={`bar`} />

    // prefer
    <Component foo="bar" />

## Custom styling
Use existing [react-components](https://github.com/canonical/react-components) as much as possible. If you need to customize, use existing vanilla classes over writing new CSS. Use vanilla [utility classes](https://vanillaframework.io/docs/utilities/align) where possible. For custom CSS, use vanilla CSS variables for [spacing](https://vanillaframework.io/docs/settings/spacing-settings#vertical-spacing) and colors. Use the themed colors instead of hardcoding colors to avoid problems with switching from light to dark theme.

# Supporting stable LXD versions
When making a contribution to this project, please ensure the UI works correctly against the latest stable LXD release. 

For new features that use LXD API endpoints not yet available in the current stable release, check against `api_extensions` returned by the `GET /1.0/` endpoint and guard the feature appropriately using the `useSupportedFeatures` hook. Features should be hidden or disabled when using stable LXD versions that do not yet support them. You can find a comprehensive list of `api_extensions` in the [LXD documentation](https://canonical.com/lxd/docs/latest/api-extensions/).

Write e2e tests for new features to verify they work correctly on both latest/stable and latest/edge LXD versions.

# End-to-end tests

Install playwright and its browsers

    npx playwright install

E2E tests run against both latest/stable and latest/edge LXD releases to ensure the UI works correctly with both versions. For development testing, use the latest stable version:

    sudo snap refresh --channel=latest/stable lxd

The login e2e tests will require oidc setup for your lxd server. You may refer to the [Setup oidc login wiki page](https://github.com/canonical/lxd-ui/wiki/Setup-oidc-login) for setup instructions. Once you have completed the oidc setup, create a `.env.local` file at the root level of the project and ensure the environment variables shown below are set against the relevant lxd server oidc config values:
    # Configs that enables OIDC authentication for the lxd server
    LXD_OIDC_CLIENT_ID=[oidc.client.id]
    LXD_OIDC_ISSUER=[oidc.issuer]
    LXD_OIDC_AUDIENCE=[oidc.audience]
    # Config required for provisioning the OIDC identity with permissions through IDP group mappings
    LXD_OIDC_GROUPS_CLAIM=[oidc.groups.claim]
    
    # user email and password from your identity provider for the identity that you intend to authenticate with
    LXD_OIDC_USER=[login-user-email]
    LXD_OIDC_PASSWORD=[login-user-password]

The tests expect the environment on localhost to be accessible. Execute `workshop run dev serve` first then run the tests. See the available test commands in `package.json` and run the appropriate command for the LXD version you are testing against.

### Nice utilities from Playwright

Generate new tests with helper [Doc](https://playwright.dev/docs/codegen)

    npx playwright codegen --ignore-https-errors https://localhost:8407/

Explore and debug tests in UI mode [Doc](https://playwright.dev/docs/test-ui-mode)

    npx playwright test --ui

Learn more about the [test architecture](ARCHITECTURE.MD#e2e-test-setup-for-multiple-lxd-versions) in our architecture documentation.

# Restricted permission setup

## How to remove admin permissions

For testing features with a read only access, set up limited permissions for your user.

### Step 1: Create a read-only group (optional if group already exists)
1. In the UI, navigate to **Permissions > Auth groups**.
2. Click on **Create group**.
3. Enter a name for the new group, for example, `read-only`.
4. Click on **Add permissions**. Set the **Resource type** to `server`. Set the **Entitlement** to `viewer`. And click on **Add**.
5. Go back to the group's details by clicking on **Create auth group** in the breadcrumbs.
6. Click **Add identities**. Select yourself. If you can't identify yourself in the list, you can check your name in **Permissions > Identities**.
7. Click on **Create group**.

### Step 2: Remove admin rights
1. In the UI, navigate to **Permissions > Identities**.
2. Click on the **people icon** at the end of your line to edit groups.
3. Deselect the `admins` group.
4. Click on **Save 1 group change**.

## Restore admin permissions
If you have removed your admin rights, the only way to get them back is through the command line. This is because non-admin users cannot edit their own group memberships in the UI.

1. Find your user ID (also known as a fingerprint) to identify your user. You can find this ID either in the UI or from the CLI.
* In the UI: The ID is listed in the **ID** column on the **Identities** page.
* From the CLI: Run the command `lxc auth identy list` to see a list of trusted identities and their fingerprints. The User ID is in the fingerprint column.

2. Edit your Identity via the CLI. Run the command (replace `{YOUR_USER_ID}` with the fingerprint you found in the previous step.):
```
lxc auth identity edit tls/{YOUR_USER_ID}
```

This command will open a text editor in your terminal. Look for the `groups` field.

Add the `- admins` entry to the list of groups. This will add you back to the administrators group. The file should look something like this:
```
# ... other settings
groups:
- admins
- read-only
# ... other settings
```
Save and exit the editor by pressing **CTRL+X**, then **Y**.

Refresh your UI to see your administrator permissions restored.

# Review pull requests

From the PR page, copy the `user:branch` reference, such as `edlerd:feature-branch`. You can find it in the header of the PR page. Use the `fetch-pr` script to fetch the branch and check it out:
```
./tests/scripts/fetch-pr.sh edlerd:feature-branch
```

(Re-) start `workshop run dev serve` and open the UI in your browser to review the changes.

# Advanced setup

Learn how to 
- [Setup local LXD cluster](https://github.com/canonical/lxd-ui/wiki/Setup-local-LXD-cluster) inside LXD to enable clustering features
- [Setup oidc login](https://canonical.com/lxd/docs/latest/howto/oidc_auth0/) to enable SSO authentication
- See [Architecture](ARCHITECTURE.MD) for details on the dev setup. 
