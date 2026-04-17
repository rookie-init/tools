已经按“单独一个 GitHub 身份”这条路配好了本地侧。

我做了这些变更：

- 新生成了一把专用 SSH key：/Users/gup/.ssh/id_rookie_init_tools
- 在 /Users/gup/.ssh/config 里新增了 Host github-rookie-init，并保留了备份 /Users/gup/.ssh/config.bak-20260417
- 把这个仓库的 origin 改成了 git@github-rookie-init:rookie-init/tools.git

我刚验证到的结果是：

- /Users/gup/.ssh/config 里已经有 github-rookie-init，对应 IdentityFile ~/.ssh/id_rookie_init_tools
- git remote -v 已经是 git@github-rookie-init:rookie-init/tools.git

现在还差最后一步，这一步必须你在 GitHub 上做：
把下面这把公钥加到对 rookie-init/tools 有写权限的那个 GitHub 账号里。

XXXXX

GitHub 路径是 Settings -> SSH and GPG keys -> New SSH key。

你加完以后，执行：

ssh -T github-rookie-init
git push origin main
