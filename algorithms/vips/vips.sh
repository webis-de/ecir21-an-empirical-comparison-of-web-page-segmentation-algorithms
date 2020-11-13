#!/bin/bash

script="VIPSScript"
script_version=1.0.0
scripts_directory="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"/scripts/
id=UNKNOWN
keep=0
pdoc=""

OPTS=$(getopt --name $(basename $0) --options a:i:kp:r:u:o: --longoptions archive:,id:,keep,pdoc:,reproductionmode:,url:,output: -- $@)
if [[ $? -ne 0 ]]; then
    exit 2
fi
eval set -- "$OPTS"

while true;do
  case "$1" in
    -a|--archive)
      archive=$(readlink -f -- "$2")
      shift 2
      ;;
    -i|--id)
      id=$2
      shift 2
      ;;
    -k|--keep)
      keep=1
      shift 1
      ;;
    -p|--pdoc)
      pdoc="--env PDoC=$2"
      shift 2
      ;;
    -r|--reproductionmode)
      mode="-$2"
      shift 2
      ;;
    -u|--url)
      url="$2"
      shift 2
      ;;
    -o|--output)
      output="$2"
      shift 2
      ;;
    --)
      break
      ;;
  esac
done

if [ \( -z "$archive" \) -o \( -z "$url" \) -o \( -z "$output" \) ];then
  echo "USAGE"
  echo "  $0 [OPTIONS] --archive <directory> --url <url> --output <directory>"
  echo "WHERE"
  echo "  --archive <directory>"
  echo "    Specifies the archive directory created by archive.sh"
  echo "  --id <id>"
  echo "    Specifies the page ID (used in the output JSON)"
  echo "  --keep"
  echo "    Specifies to keep log files"
  echo "  --pdoc <permitted-degree-of-coherence>"
  echo "    Specifies the PDoC parameter (overruling the one in vips.conf)"
  echo "  --url <url>"
  echo "    Specifies the start URL for the script"
  echo "  --output <directory>"
  echo "    Specifies the directory to which logs and the script output are written"
  echo "  --reproductionmode [warcprox|pywb]"
  echo "    Changes the program used for web page reproduction from a custom"
  echo "    implementation to warcprox or pywb"
  exit 1
fi

mkdir -p $output # Creating directory is required to give web-archiver user permission to write
output=$(readlink -f -- $output)

maindir=$(readlink -f -- $(dirname $0)/..)

is_in_docker_group=$(groups | sed 's/ /\n/g' | grep '^docker$' | wc -l)

# Mounting /dev/shm is required for taking big screenshot in chrome
# /warcs/ can not be mounted read-only for warcprox mode (which does, however, not change anything, but tests that it could write on startup)
command="docker run --rm --user $(id -u) --env URL=\"$url\" --env DBUS_SESSION_BUS_ADDRESS=/dev/null --env MODE="reproduce$mode" --env SCRIPT=$script --env SCRIPT_VERSION=$script_version $pdoc --volume $scripts_directory:/resources/scripts/:ro --volume $archive:/warcs/ --volume $output:/output/ --volume /dev/shm/:/dev/shm -a stdout -a stderr webis/web-archive-environment:1.2.1"
if [ $is_in_docker_group -eq 0 ];then
  sudo $command
else
  $command
fi

# Getting output segmentation (replacing ID)
cat $output/script/vips.json \
  | sed "s/TBFWID/$id/" \
  > $output/vips.json
rm -rf $output/script

if [ $keep -eq 0 ];then
  # Removing logs
  rm -rf $output/logs
fi

