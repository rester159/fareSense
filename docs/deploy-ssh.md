# Deploy & SSH — Repo and Server Access

Reference for agents: git remote, SSH host, and key location. **Never commit the private key file itself.**

---

## Git

- **Remote:** `https://github.com/rester159/dokidoki`
- **SSH URL (if using SSH with GitHub):** `git@github.com:rester159/dokidoki.git`

---

## SSH — Deploy / Server (enrico.local)

| Field    | Value        |
|----------|--------------|
| **Host** | `enrico.local` |
| **User** | `root`       |
| **Port** | `22`         |
| **Key**  | `C:\Users\edang\.ssh\unraid_deploy` (private key on this machine; use the matching `.pub` for server `authorized_keys`) |

### Usage

- **Open SSH session:** `ssh -i "C:\Users\edang\.ssh\unraid_deploy" root@enrico.local`
- **From Git Bash / WSL:** `ssh -i ~/.ssh/unraid_deploy root@enrico.local` (if the key is copied there)
- **SCP/SFTP:** Use the same key path with your client.

### Security

- Keep `unraid_deploy` (private key) out of the repo and off any shared storage.
- This file documents *where* the key lives and *how* to connect; it does not contain key material.

---

## Missing / Optional

- **Key passphrase:** If the key is passphrase-protected, agents cannot unlock it; run SSH/SCP yourself or use an agent that can prompt for passphrase.
- **Server path for app:** If you deploy this repo to enrico.local, the path on the server (e.g. `/var/www/dokidoki` or similar) is not specified; add it here when you have it.
- **Git branch for deploy:** e.g. `main` or `production` — add if you use a specific branch for deploys.
