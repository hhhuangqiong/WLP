# M800 White Label Portal

## Branch

```
# To checkout based on the remote branch, 'bolt'
git checkout -t origin/<branch> -b <topic-branch-name>;
# e.g.,
git checkout -t origin/bolt -b my-task

# To update *existing* topic branch to track new remote branch
git branch -u origin/<branch>
# e.g.,
git branch -u origin/bolt

# To push for code review
git push origin @:refs/for/<branch>;
# e.g.,
git push origin @:refs/for/bolt

# To rebase after fetch, `git fetch`
git rebase -p origin/<branch>;
# e.g.,
git rebase -p origin/bolt;
```

## Deployment

Tools:

- [PM2](https://github.com/Unitech/pm2)

```
npm i -g pm2

pm2 start bin/www -i 0

pm2 stop all

pm2 logs

pm2 status

# for 'bind EADDRINUSE'
pm2 kill
pm2 kill
```

## Diagram

Tool:

- [Mermaid](https://github.com/knsv/mermaid)

Steps:

```
# required packages to generate the diagram
npm i -g mermaid phantomjs

# generate 'COMPONENTS.md.png'
mermaid COMPONENTS.md -v
```

## Reference

- [Requirements](http://issuetracking.maaii.com:8090/display/MAAIIPR/WL+Portal+Requirements)
- [wireframe](http://192.168.118.63/~louislam/m800-white-label-portal-v2/)
- [layout preview](http://issuetracking.maaii.com:8080/browse/UMWP-45)

