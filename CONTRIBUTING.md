# Sending a pull request

1. Fork the repository

2. Clone the fork to your local machine and add the upstream remote:

       git clone https://github.com/<your username>/lxd-ui.git
       cd lxd-ui
       git remote add upstream https://github.com/canonical/lxd-ui.git

3. Setup LXD as a backend:
  
     <details>
      <summary>Setup LXD - Linux (with snap)</summary>
      <br/>
      <pre><code>snap install lxd
    lxd init # can accept all defaults
    lxc config set core.https_address "[::]:8443"
    lxc config set user.show_permissions=true</code></pre>
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


4. Install [dotrun](https://github.com/canonical/dotrun#installation) and launch it from the head of this repo

       dotrun

    You should enable a firewall as `dotrun` exposes an api to start or interact with unprivileged containers on your public
    ip via port `8407`. Ensure that the lxd API on port `8443` is open, so `dotrun` can access it.

    The first time, running `dotrun` will generate certificates for you. You can find them in the `keys` folder on the top level of
    the repo. Trust them from your local `lxc` with

       sudo lxc config trust add keys/lxd-ui.crt

    If you are on a Mac and running LXD inside Multipass, set the `LXD_UI_BACKEND_IP` in the `.env.local` file:

       echo "LXD_UI_BACKEND_IP=$(multipass info lxd | grep IPv4 | awk '{print $2}')" > .env.local

    Now you can open https://localhost:8407/ to reach lxd-ui.


5. To enable pre-commit checks, after the first successful run of `dotrun`, execute `yarn hooks-add`. To remove them, run `yarn hooks-remove`.


6. Create a new topic branch:

       git checkout -b my-topic-branch


7. Make changes, commit, and push to your fork:

       git push -u origin HEAD


8. Go to the [repository](https://github.com/canonical/lxd-ui/) and open a pull request.

The team actively monitors for new pull requests. We will review your PR and either merge it, request changes to it, or close it with an explanation.

# License and copyright
All contributors must sign the [Canonical contributor license agreement](https://ubuntu.com/legal/contributors), which gives Canonical permission to use the contributions. The author of a change remains the copyright holder of their code (no copyright assignment).

# Signing off commits
All commits are required to be signed off using a GPG key. You can use the following references to set up your git configurations for commit signing.
1. [Generating a new GPG key](https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key) or [use an existing GPG key](https://docs.github.com/en/authentication/managing-commit-signature-verification/checking-for-existing-gpg-keys). Make sure that the GPG key is associated to the email that you are using within your git configuration. If you have multiple GPG keys set up, you should [tell git about your signing GPG key](https://docs.github.com/en/authentication/managing-commit-signature-verification/telling-git-about-your-signing-key).
2. [Add a GPG key to your Github account](https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-gpg-key-to-your-github-account). This will make your commits verified on Github.
3. To sign commits, you should enter the git command with additional flags as shown in this example: `git commit -s -S -a -m "initial commit"`.
4. To make your life a little easier, you can setup a git alias for signing commits with `git config alias.sc 'commit -s -S -a'`. Now you can sign your commits with `git sc -m "initial commit"` for example. Note this only enables the alias for your local git configuration.

# Supporting multiple lxd versions
When making a contribution to this project, please take note that the UI should degrade gracefully for all lxd LTS versions later than v5.0. To acheive this, there are two processes that should be followed:

1. When adding a new feature that introduces lxd api endpoints that are not currently used in the project, make sure you check against `api_extensions` returned by the `GET /1.0/` endpoint if the new endpoints used exists for older lxd versions. If the new endpoints are not supported in an older lxd version, then you should either hide or disable a portion of the new feature for the relevant lxd version. A useful `useSupportedFeatures` hook can be used for this purpose. You can also find a comprehensive list of `api_extensions` refrences in the [lxd documentation](https://documentation.ubuntu.com/lxd/en/latest/api-extensions/).
2. You should write e2e tests that covers the new feature for all supported lxd versions. For example, if your feature is hidden for an older lxd server version, you should test that it is not displayed in the browser for that lxd version.

# End-to-end tests

Install playwright and its browsers

    npx playwright install

The e2e tests can be run against LXD 5.0, or the edge version of LXD. If you want to run the tests against the edge version, first make sure your lxd is up to date with

    snap refresh lxd --channel latest/edge

The tests are carried out for oidc authenticated identities and therefore will require oidc setup for your lxd server. You may refer to the [Setup oidc login wiki page](https://github.com/canonical/lxd-ui/wiki/Setup-oidc-login) for setup instructions. Once you have completed the oidc setup, create a `.env.local` file at the root level of the project and ensure the environment variables shown below are set against the relevant lxd server oidc config values:
    # Configs that enables OIDC authentication for the lxd server
    LXD_OIDC_CLIENT_ID=[oidc.client.id]
    LXD_OIDC_ISSUER=[oidc.issuer]
    LXD_OIDC_AUDIENCE=[oidc.audience]
    # Config required for provisioning the OIDC identity with admin permission
    LXD_OIDC_GROUPS_CLAIM=[oidc.groups.claim]
    
    # user email and password from your identity provider for the identity that you intend to authenticate with
    LXD_OIDC_USER=[login-user-email]
    LXD_OIDC_PASSWORD=[login-user-password]

The tests expect the environment on localhost to be accessible. Execute `dotrun` first then run the tests against the latest LXD version with

    yarn test-e2e-edge

or against the LTS LXD versions with
    
    yarn test-e2e-5.21-edge
    yarn test-e2e-5.0-edge

### Nice utilities from Playwright

Generate new tests with helper [Doc](https://playwright.dev/docs/codegen)

    npx playwright codegen --ignore-https-errors https://localhost:8407/

Explore and debug tests in UI mode [Doc](https://playwright.dev/docs/test-ui-mode)

    npx playwright test --ui

Learn more about the [test architecture](ARCHITECTURE.MD#e2e-test-setup-for-multiple-lxd-versions) in our architecture documentation.

# Advanced setup

Learn how to 
- [Setup local LXD cluster](https://github.com/canonical/lxd-ui/wiki/Setup-local-LXD-cluster) inside LXD to enable clustering features
- [Setup oidc login](https://github.com/canonical/lxd-ui/wiki/Setup-oidc-login) to enable SSO authentication
- See [Architecture](ARCHITECTURE.MD) for details on the dev setup. 

