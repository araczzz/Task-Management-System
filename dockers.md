### Why is Alpine smaller than Node Image?

- Since **node** requires a lot of libraries, **Alpine** images are smaller.
- If you want a **lightweight** server OS for virtualization or containers, Alpine is the one to go for.
- According to <a href="https://hub.docker.com/_/alpine">Alpine Docker Hub</a>, the image is only 5 MB in size and has access to a package respository.
- Important to use Alpine because our primary concern is for the final image size to be as small as possible.
- Alpine Linux is a Linux distribution.
- Smaller images require less memory, better performance, security and maintainability.
- A smaller docker image reduces the size needed on disk, but <i>disk space is cheap</i>.
- Another feature is that base images from alpine use depend on fewer libraries, which improves the overall security.

### What is apk?

- `apk` is the Alpine Package Keeper - the distribution's package manager.
- It is the primary method for installing additional software, and is available in the `apk-tools` package.
- `apk` fetches information about available packages, as well as the packages themselves from various mirrors, which contain various repositories.
  |Mirror|Release|Repository|
  |:-:|:-:|:-:|
  |A website that hosts repositories|A collection of snapshots of various repositories|A category of packages, tied together by some attribute.|

### What is an MD5 checksum and what is it used for?

- An MD5 checksum is a 32-character hexadecimal number that is computed on a file.
- If 2 files have the **same MD5 checksum**, then there is a **high probability that the 2 files are the same**.
- To verify the integrity of the files.

### What is a .tar file?

- A .tar file is an archive created by tar, a Unix-based utility used to package files together for backup or distribution purposes.
- An archive file is a computer file that is composed of 1 or more files along with metadata.
- An archive is a collection of data moved to a repository for long-term retention, to be kept separate for compliance reasons or for moving off primary storage media.
- It contains multiple files stored in an uncompressed format along with **metadata** about the archive.
- .tar files are commonly compressed into .GZ files with GNU Zip Compression.

### Docker group

- The docker group grans privileges equivalent to the `root` user.
- Can create another docker group for `nonroot` users and add users into this docker group so they do not have the rights of a `root` user.
