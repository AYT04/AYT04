# Archive
![example video](https://codeberg.org/janw/podcast-archiver/media/branch/main/.assets/demo.gif)

### Usage

## Install via pipx:

```bash
$:~ pipx install podcast-archiver
```

## Install via brew:

```bash
$:~ brew install podcast-archiver
```

## Or use it via Docker:

```bash
$:~ docker run --tty --rm codeberg.org/janw/podcast-archiver --help
```
By default, the docker image downloads episodes to a volume mounted at /archive.

### [podcast-saver](https://codeberg.org/janw/podcast-archiver) - Windows
```bash
$:~ pipx run podcast-archiver --dir ~/Podcasts --feed URL
```

### [podcast-saver](https://codeberg.org/janw/podcast-archiver) - Linux
```bash
$:~ podcast-archiver --dir ~/Podcasts --feed URL
```
