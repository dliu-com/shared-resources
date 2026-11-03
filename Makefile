AWS_REGION ?= eu-west-1
FILES_STACK ?= FileServer
output = $(shell aws cloudformation describe-stacks --region $(AWS_REGION) --stack-name $(FILES_STACK) \
	--query "Stacks[0].Outputs[?OutputKey=='$(1)'].OutputValue" --output text)
FILES_BUCKET ?= $(call output,FileBucketName)

.PHONY: check publish audit

# Lists what publish would send (files whose bytes or type differ from the object in S3).
check:
	FILES_BUCKET="$(FILES_BUCKET)" node scripts/publish.mjs --dry-run

# Uploads changed files in public/ to https://files.dliu.com/dliu.com/ through the Files managed API,
# with the Microsoft access token saved from auth.dliu.com (~/.dliu_token).
publish:
	FILES_BUCKET="$(FILES_BUCKET)" FILES_API_URL="$${FILES_API_URL:-$(call output,MicrosoftApiUrl)}" node scripts/publish.mjs

# Checks the live pages of every site in sites.json for the shared look (stylesheet, logos, header, footer, CSP).
audit:
	node scripts/audit.mjs
