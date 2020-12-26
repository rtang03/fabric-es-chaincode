### How to create a release

_step 1: Manually update Changelog_
Optionally, update the release number under `dev-net/scripts/setup.sh`

```shell script
export RELEASE=0.0.5
```

_step 2: Commit and push all changes_

_step 3: create release tag_
Method 1:  

This will bump version, create version tag, and push to origin in go.

```shell script
# Optionally sign the tag
npm config set sign-git-tag true

# increment version
npm version patch
```

Method 1 will update `lerna.json` and related packages' version automatically. Therefore, cannot not run repeatedly 

Method 2:    
If the release by methed 1 fails, can choose manually create version tag, and push.

```shell script
# create local tag
git tag -a v0.5.1 -m "Releasing version v0.5.1"

# push remote
git push origin v0.5.1
```

For development and troubleshoot, you may fail the _create-image_ workflow, for a specific release tag. You
need delete the local and remote tag, in order to re-push the same tag.

```shell script
# delete local tag
git tag -d v0.5.1

# delete remote tag
git push --delete origin v0.5.1
```

After both local and remote tags are removed,

- commit all changes
- repeat above method 2: (a) create local tag, (b) push remote

### Reference info

[create gcp service account key](https://github.com/GoogleCloudPlatform/github-actions/tree/docs/service-account-key/setup-gcloud#inputs)  
[create git tag](https://dev.to/neshaz/a-tutorial-for-tagging-releases-in-git-147e)
[delete git tag](https://devconnected.com/how-to-delete-local-and-remote-tags-on-git/)
[changelog](https://keepachangelog.com/en/0.3.0/)
[awesome-actions](https://github.com/sdras/awesome-actions)
