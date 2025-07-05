#!/bin/bash

# create a function to filter words based on my personal linguistic taste
shopt -s extglob

filter_word() {
	local word=$1

	case $word in
		*[cC]* | *[qQ]* | *[xX]* | *[oO][uU]* | *gh* | *[pP][hH]* | *[ate|ATE] | *[eE])
			return 1
			;;
		*)
			;;
	esac

	if echo $word | grep -q -e "\([[:alpha:]]\)\1\+"; then
		return 1
	fi
	# return $?
	return 0
}

# I am not exactly sure why this if/while works...
if [ -p /dev/stdin ]; then
	while read input; do
		# convert the input to a string array
		str_array=($input)
		for word in "${str_array[@]}"; do
			if filter_word $word; then
				echo $word
			fi 
		done
	done
else
	exit 1
fi
exit 0

