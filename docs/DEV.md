# Developing WLP

# Branch

```
# To checkout based on the remote branch
git checkout -t origin/<branch> -b <topic-branch-name>
# e.g.,
git checkout -t origin/bolt -b my-task

# To update *existing* topic branch to track new remote branch
git branch -u origin/<branch>
# e.g.,
git branch -u origin/bolt

# To push for code review
git push origin @:refs/for/<branch>
# e.g.,
git push origin @:refs/for/bolt

# To rebase after fetch, `git fetch`
git rebase -p origin/<branch>
# e.g.,
git rebase -p origin/bolt
```
