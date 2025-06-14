#!/bin/bash

# script to score 8 letter words to help pick the words for levels 9/10
# to use:
# $ cat <word list> | ./score_word.sh

score_word_v1() {
	# declare inside a fn is automatically local
	declare -i score=0
	local leet_letters=(a b e g i o s t)

	for ll in "${leet_letters[@]}"; do
		echo $1 | grep -q $ll
		score=$(($score + (1 - $?) ))
	done
	echo $score
}

score_word_v2() {
	declare -i score=0
	local leet_letters="abegiost"
	local word=$1

	# https://stackoverflow.com/a/10552175
	for (( l_i=0; l_i < ${#word}; l_i++ )); do
		letter="${word:$l_i:1}"
		echo $leet_letters | grep -q $letter 
		score=$(($score + (1 - $?) ))
	done
	echo $score
}

# I am not exactly sure why this if/while works...
# Specifically, why does the while terminate properly?
if [ -p /dev/stdin ]; then
	while read word_in; do
		echo "$word_in -> $(score_word_v2 $word_in)"
	done
else
	exit 1
fi
exit 0

