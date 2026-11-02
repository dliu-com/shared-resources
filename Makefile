AWS_REGION ?= eu-west-1
FILES_STACK ?= FileServer

.PHONY: check publish audit

# Lists what publish would send (files that differ from https://files.dliu.com/dliu.com/).
check:
	node scripts/publish.mjs --dry-run

# Uploads changed files in public/ to https://files.dliu.com/dliu.com/ with the token saved from auth.dliu.com.
publish:
	FILES_API_URL="$${FILES_API_URL:-$$(aws cloudformation describe-stacks --region $(AWS_REGION) --stack-name $(FILES_STACK) \
		--query "Stacks[0].Outputs[?OutputKey=='MicrosoftApiUrl'].OutputValue" --output text)}" \
		node scripts/publish.mjs

# Checks the live pages of every site in sites.json for the shared look (stylesheet, DL icon, header, CSP).
audit:
	node scripts/audit.mjs
