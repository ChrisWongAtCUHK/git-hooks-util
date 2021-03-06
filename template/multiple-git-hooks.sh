# This script should be saved in a git repo as a hook file, e.g. .git/hooks/pre-receive.
# It looks for scripts in the .githooks/pre-receive directory and executes them in order,
# passing along stdin. If any script exits with a non-zero status, this script exits.

script_dir=".githooks"
hook_name=$(basename $0)

hook_dir="$script_dir/$hook_name"

if [[ -d $hook_dir ]]; then
  stdin=$(cat /dev/stdin)

  for hook in $hook_dir/*; do
    echo "$stdin" | $hook "$@"

    exit_code=$?

    if [ $exit_code != 0 ]; then
      exit $exit_code
    fi
  done
fi

exit 0
