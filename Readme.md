# API Builder
A templating engine capable of replicating a template based folder and file system, for generating the final output, using string manipulation and tokens.

### Prequisites
Since this is a private repository, we will need to first setup the ssh key on local system and register in to the respective github account. For more details kindly refer [this article](https://help.github.com/en/articles/connecting-to-github-with-ssh).

### Installation
`npm install --global git+ssh://github.com/travelex/api-builder`
&nbsp;or
`npm i -g git+ssh://github.com/travelex/api-builder`

### Usage
`build-api <template-name>.json`

- ##### `<template-name>`
Relative or absolute path to the template configuration file of json format. Below is the list of paramaters and a sample json attached for reference.
	- sourceTemplatePath - relative or absolute path to the source template file system structure.
	- destinationPath - relative or absolute path to the the destination or output directory structure.
	[Note: Here relativeness of both the path is w.r.t to the config json file path]
	- tokens - A json object which holds the token keys to be used for output file name, folder name and file content generation.
	- Sample config json: [api-template-config.json](./samples/api-template-config.json)
- ##### Generating folder names and file names as per the sample config
	- ###### Simple tokens
		- `[domain]` refers to the domain from tokens section and will render *user* in camel case.
		- `[Domain]` a case senstive version of `[domain]` to render *User* in Pascal case.
	- ###### Looped tokens
		- `[endpoints.name]` will result into creation of two folders namely *create* and *list*, also any subsequent directory or file name within *create* and *list* will use the individial endpoint item configuration.
	- ###### Nested tokens
		- `[packagename]` here renders `[domain]-fn-[name]`, which will further render into *user-fn-create*
	- ###### Example
		- A folder structure generated using the above mentioned format, would be converted as belows:
			- Template folder structure
			```
				The sample template directory structure
				|_ [endpoints.packagename]
				|  |_ bin
				|  |  |_ index.js
				|  |_ lib
				|  |  |_ business
				|  |  |  |_ [domain].[name].js
				|  |  |_ dal
				|  |  |  |_ [domain].dal.js
				|  |  |_ model
				|  |  |  |_ @types
				|  |  |  |  |_ [domain].bo.d.ts
				|  |  |  |  |_ [domain].dto.d.ts
				|  |  |  |_ mapper
				|  |  |  |  |_ bo2dto.js
				|  |  |  |  |_ dto2bo.js
				|  |  |  |_ dependency.js
				|  |  |  |_ mongodb-wrapper.js
				|  |  |_ .dockerignore
				|  |  |_ package.json
			```
			- Output folder structure
			```
				The sample template directory structure
				|_ user-fn-create
				|  |_ bin
				|  |  |_ index.js
				|  |_ lib
				|  |  |_ business
				|  |  |  |_ user.create.js
				|  |  |_ dal
				|  |  |  |_ user.dal.js
				|  |  |_ model
				|  |  |  |_ @types
				|  |  |  |  |_ user.bo.d.ts
				|  |  |  |  |_ user.dto.d.ts
				|  |  |  |_ mapper
				|  |  |  |  |_ bo2dto.js
				|  |  |  |  |_ dto2bo.js
				|  |  |  |_ dependency.js
				|  |  |  |_ mongodb-wrapper.js
				|  |  |_ .dockerignore
				|  |  |_ package.json
				|_ user-fn-list
				|  |_ bin
				|  |  |_ index.js
				|  |_ lib
				|  |  |_ business
				|  |  |  |_ user.list.js
				|  |  |_ dal
				|  |  |  |_ user.dal.js
				|  |  |_ model
				|  |  |  |_ @types
				|  |  |  |  |_ user.bo.d.ts
				|  |  |  |  |_ user.dto.d.ts
				|  |  |  |_ mapper
				|  |  |  |  |_ bo2dto.js
				|  |  |  |  |_ dto2bo.js
				|  |  |  |_ dependency.js
				|  |  |  |_ mongodb-wrapper.js
				|  |  |_ .dockerignore
				|  |  |_ package.json
			```
- ##### Generating file content as per the sample config
	- ###### Simple tokens
		- `[domain]` refers to the domain from tokens section and will render *user* in camel case.
		- `[Domain]` a case senstive version of `[domain]` to render *User* in Pascal case.
	- ###### Looped tokens
		- `[$for endpoints]...[^for endpoints]` will mark the code section between the two tags as a scope, which will be generated on a iterative basis using each item as a single configuration for token resolution. **Note**: In case a token is not identified into the item config, then the root configuration is referred and the token is resolved.
		**For eg**: Within a directory named `[endpoints.name]`, a single endpoint item will be used a the token resolution context, below are the sample template file and the respective output:
			- Sample input
			```javascript
			export namespace BO {
				export interface [Domain] {
					[$for members]
					[field]: [type];
					[^for members]
				}
			}
			```
			- Generated output
			```
			export namespace BO {
				export namespace [User] {
					name?: string;
					email?: string;
					mobile?: string;
				}
			}
			```
	- ###### Nested tokens
		- `[packagename]` here renders `[domain]-fn-[name]`, which will further render into *user-fn-create*. This feature is not supported inside a looped token implementation, kindly make sure while working with a looped execution use tokens of the format `[tokenname]`, without any dot, since including a dot concludes a nested token.
