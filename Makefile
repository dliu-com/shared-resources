AWS_REGION ?= eu-west-1
FILES_STACK ?= FileServer
FILES_BUCKET ?= $(shell aws cloudformation describe-stacks --region $(AWS_REGION) --stack-name $(FILES_STACK) \
	--query "Stacks[0].Outputs[?OutputKey=='FileBucketName'].OutputValue" --output text)

.PHONY: check publish audit

# Lists what publish would send (files whose bytes, type or cache header differ from what is in S3).
check:
	FILES_BUCKET="$(FILES_BUCKET)" node scripts/publish.mjs --dry-run

# Writes changed files in public/ to https://files.dliu.com/dliu.com/ with your AWS CLI credentials.
publish:
	FILES_BUCKET="$(FILES_BUCKET)" node scripts/publish.mjs

# Checks the live pages of every site in sites.json for the shared look (stylesheet, logos, header, footer, CSP).
audit:
	node scripts/audit.mjs
