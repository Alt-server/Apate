/**
 * @name Apate
 * @version 1.2.4
 * @description Hide your secret Discord messages in other messages!
 * @author TheGreenPig & Aster
 * @source https://github.com/TheGreenPig/Apate/blob/main/Apate.plugin.js
 * @updateUrl https://raw.githubusercontent.com/TheGreenPig/Apate/main/Apate.plugin.js
 * @authorLink https://github.com/TheGreenPig
 */

/* 
 * BetterDiscord BdApi documentation:
 *   https://github.com/BetterDiscord/BetterDiscord/wiki/Creating-Plugins
 * 
 * BetterDiscord file structure documentation:
 *   https://github.com/BetterDiscord/documentation/blob/main/plugins/file_structure.md
 *  
 * Zere's Plugin Library documentation:
 * 	 https://rauenzi.github.io/BDPluginLibrary/docs/
 */

module.exports = (() => {
	const config = {
		info: {
			name: "Apate",
			authors: [{
				name: "Aster",
				discord_id: "534335982200291328",
				github_username: "BenjaminAster",
				website: "https://benjaminaster.com/"
			}, {
				name: "AGreenPig",
				discord_id: "427179231164760066",
				github_username: "TheGreenPig"
			}],
			version: "1.2.4",
			description: "Apate lets you hide messages in other messages! - Usage: coverText *hiddenText*",
			github_raw: "https://raw.githubusercontent.com/TheGreenPig/Apate/main/Apate.plugin.js",
			github: "https://github.com/TheGreenPig/Apate"
		},
		changelog: [
			{
				title: "New features",
				type: "added",
				items: [
					"Generates Passwords that are easier to identify.",
					"Save password when changed, but only if it was used.",
					"Send message with different encryption one time (right click Key)",
				]
			},
			{
				title: "Removed features",
				type: "fixed",
				items: [
					"Removed support for old Apate messages without verification character (To improve decryption speed).",
				]
			},
		],
	};
	class HTMLWrapper extends BdApi.React.Component {
		componentDidMount() {
			this.refs.element.appendChild(this.props.children);
		}

		render() {
			return BdApi.React.createElement("div", {
				className: "react-wrapper",
				ref: "element"
			});
		}
	}


	return !global.ZeresPluginLibrary ? class {
		load() {
			BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
				confirmText: "Download Now",
				cancelText: "Cancel",
				onConfirm: async () => {
					const zeresPluginLib = await (await globalThis.fetch("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js")).text();

					await new Promise(
						resolve => require("fs").writeFile(
							require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"),
							zeresPluginLib,
							resolve,
						),
					);
				},
			});
		};
	} : (([Plugin, Api]) => {
		const plugin = (Plugin, Api) => {
			let apateCSS = [
				`.apateKeyButtonContainer {`,
				`	display: flex;`,
				`	justify-content: center;`,
				`	align-items: center;`,
				`}`,
				`.apateEncryptionKeyButton {`,
				`	transition: all 300ms ease;`,
				`	overflow: hidden;`,
				`	font-size: 1rem;`,
				`	display: flex;`,
				`	justify-content: center;`,
				`	align-items: center;`,
				`	clip-path: inset(0);`,
				`	width: 3em;`,
				`	height: 2.8em;`,
				`}`,
				`.apateEncryptionKeyContainer {`,
				`	padding: 0;`,
				`	width: 5rem;`,
				`	height: 5rem;`,
				`}`,
				`.apateEncryptionKey {`,
				`	transition: all 300ms ease;`,
				`	font-size: 1.3rem;`,
				`	width: 2em;`,
				`	height: 2em;`,
				`}`,
				`.apateHiddenImg {`,
				`	padding: 0.4em;`,
				`	max-width: 400px;`,
				`	max-height: 300px;`,
				`}`,
				`@keyframes apateRotate {`,
				`	0%   { transform: rotate(0deg);   }`,
				`	100% { transform: rotate(360deg); }`,
				`}`,
				`.apateHiddenMessage {`,
				`	border: 2px solid var(--interactive-muted);`,
				`	color: var(--text-normal);`,
				`	padding: 0.4em 0.5em;`,
				`	line-height: normal;`,
				`	margin: .3em 0;`,
				`	width: fit-content;`,
				`	border-radius: 0 .8em .8em .8em;`,
				`	max-width: 100%;`,
				`	background-image: `,
				`		repeating-linear-gradient(-45deg, `,
				`		var(--background-tertiary) 0em, `,
				`		var(--background-tertiary) 1em, `,
				`		var(--background-floating) 1em, `,
				`		var(--background-floating) 2em);`,
				`}`,
				`.apateHiddenMessage.loading {`,
				`	font-style: italic;`,
				`	color: var(--text-muted);`,
				`}`,
				`.apateHiddenMessage.loading::after {`,
				`	content: "[loading hidden message...]";`,
				`	animation: changeLetter 1s linear infinite;`,
				`}`,
			].join("\n");

			let apateNoLoadingCSS = [
				`.apateHiddenMessage.loading {`,
				`	display: none;`,
				`}`,
				`.apateHiddenMessage.loading::after {`,
				`display: none;`,
				`}`,
			].join("\n")

			let apatePasswordCSS = [
				`.form-control{`,
				`	margin-bottom: 10px;`,
				`}`,
				`.btn-add{`,
				`	background-color: rgb(12, 187, 50);`,
				`	font-size: 1em;`,
				`	color: white;`,
				`	padding: 0.3em;`,
				`	border-radius: .25rem;`,
				`}`,
				`.downloadListButton{`,
				`	background-color: Teal;`,
				`	color: white;`,
				`	padding: 0.3em;`,
				`	font-size: 1em;`,
				`	margin-bottom: 10px;`,
				`	border-radius: .25rem;`,
				`}`,
				`.uploadListButton{`,
				`	background-color: Teal;`,
				`	color: white;`,
				`	padding: 0.3em;`,
				`	font-size: 1em;`,
				`	margin-bottom: 10px;`,
				`	border-radius: .25rem;`,
				`}`,
				`.btn-passwords{`,
				`	font-size: 1.3em;`,
				`	padding: 0em;`,
				`	background-color: transparent;`,
				`}`,
				`.dynamic-list{`,
				`	display: flex;`,
				`	-ms-flex-direction: column;`,
				`	flex-direction: column;`,
				`	padding-left: 0;`,
				`	margin-bottom: 0;`,
				`}`,
				`.passwordLi{`,
				`	width: fit-content;`,
				`	text-align: center;`,
				`	font-weight: bold;`,
				`	padding: 0.4em 0.5em;`,
				`	line-height: normal;`,
				`	margin-bottom: 10px;`,
				`	background-color: #000;`,
				`	border: 1px solid`,
				`	rgba(0,0,0,.125);`,
				`	border-top-left-radius: .25rem;`,
				`	border-top-right-radius: .25rem;`,
				`	border-bottom-left-radius: .25rem;`,
				`	border-bottom-right-radius: .25rem;`,
				`}`,
				`.ownPassword{`,
				`	width: fit-content;`,
				`	color: white;`,
				`	padding: 0.1em 0.1em;`,
				`	margin-bottom: 10px;`,
				`	background-color: transparent;`,
				`	border: 1px solid`,
				`	rgba(0,0,0,.125);`,
				`	border-top-left-radius: .25rem;`,
				`	border-top-right-radius: .25rem;`,
				`	border-bottom-left-radius: .25rem;`,
				`	border-bottom-right-radius: .25rem;`,
				`}`,
				`.selectedPassword{`,
				`	background-color: white;`,
				`}`,
			].join("\n");

			let apateSimpleCSS = [
				`.apateKeyButtonContainer {`,
				`	display: flex;`,
				`	justify-content: center;`,
				`	align-items: center;`,
				`}`,
				`.apateEncryptionKeyButton {`,
				`	transition: all 300ms ease;`,
				`	overflow: hidden;`,
				`	font-size: 1rem;`,
				`	display: flex;`,
				`	justify-content: center;`,
				`	align-items: center;`,
				`	clip-path: inset(0);`,
				`	width: 3em;`,
				`	height: 2.8em;`,
				`}`,
				`.apateEncryptionKeyContainer {`,
				`	padding: 0;`,
				`	width: 5rem;`,
				`	height: 5rem;`,
				`}`,
				`.apateEncryptionKey {`,
				`	transition: all 300ms ease;`,
				`	font-size: 1.3rem;`,
				`	width: 2em;`,
				`	height: 2em;`,
				`}`,
				`.apateHiddenImg {`,
				`	padding: 0.4em;`,
				`	max-width: 40em;`,
				`	max-height: 40em;`,
				`}`,
				`@keyframes apateRotate {`,
				`	0%   { transform: rotate(0deg);   }`,
				`	100% { transform: rotate(360deg); }`,
				`}`,
				`.apateHiddenMessage {`,
				`	border: 2px solid var(--interactive-muted);`,
				`	color: var(--text-normal);`,
				`	padding: 0.4em 0.5em;`,
				`	line-height: normal;`,
				`	margin: .3em 0;`,
				`	width: fit-content;`,
				`	max-width: 100%;`,
				`	border-radius: 0 .8em .8em .8em;`,
				`}`,
				`.apateHiddenMessage.loading {`,
				`	font-style: italic;`,
				`	color: var(--text-muted);`,
				`}`,
				`.apateHiddenMessage.loading::after {`,
				`	content: "[loading hidden message...]";`,
				`	animation: changeLetter 1s linear infinite;`,
				`}`,
			].join("\n");


			let apateAnimateCSS = [
				`.apateEncryptionKey:hover {`,
				`	font-size: 2em;`,
				`	fill: dodgerBlue;`,
				`	animation: apateRotate 0.5s ease;`,
				`	animation-iteration-count: 1; `,
				`}`,
				`.apateEncryptionKey.calculating {`,
				`	fill: orange;`,
				`	animation: apateRotate 1s linear;`,
				`	animation-direction: reverse;`,
				`	animation-iteration-count: infinite;`,
				`}`,
				`.apateEncryptionKeyButton:hover {`,
				`	width: 4em;`,
				`}`,
				`@keyframes changeLetter {`,
				`	0%   { content: "[loading hidden message]";   }`,
				`	33%  { content: "[loading hidden message.]";  }`,
				`	66%  { content: "[loading hidden message..]"; }`,
				`	100% { content: "[loading hidden message...]";}`,
				`}`,
			].join("\n");

			const buttonHTML = [
				`<div class="apateKeyButtonContainer buttonContainer-28fw2U da-buttonContainer keyButton">`,
				`	<button aria-label="Send Message" tabindex="0" type="button"`,
				`			class="apateEncryptionKeyButton buttonWrapper-1ZmCpA da-buttonWrapper button-38aScr da-button `,
				`				lookBlank-3eh9lL colorBrand-3pXr91 grow-q77ONN da-grow noFocus-2C7BQj da-noFocus"`,
				`	>`,
				`		<div class="apateEncryptionKeyContainer contents-18-Yxp da-contents button-3AYNKb da-button button-318s1X da-button">`,
				`			<svg xmlns="http://www.w3.org/2000/svg" class="apateEncryptionKey icon-3D60ES da-icon" viewBox="0 0 24 24" fill="currentColor">`,
				`				<path d="M0 0h24v24H0z" fill="none" />`,
				`				<path d="M11.9,11.2a.6.6,0,0,1-.6-.5,4.5,4.5,0,1,0-4.4,5.6A4.6,4.6,0,0,0,11,13.8a.7.7,0,0,1,.6-.4h2.2l.5.2,1,1.1.8-1c.2-.2.3-.3.5-.3l.5.2,`,
				`					1.2,1.1,1.2-1.1.5-.2h1l.9-1.1L21,11.2Zm-5,2.4a1.8,1.8,0,1,1,1.8-1.8A1.8,1.8,0,0,1,6.9,13.6Z" `,
				`				/>`,
				`			</svg>`,
				`		</div>`,
				`	</button>`,
				`</div>`,
			].join("\n");


			const colors = [
				"MediumVioletRed",
				"PaleVioletRed",
				"LightPink",
				"Red",
				"IndianRed",
				"OrangeRed",
				"DarkOrange",
				"DarkKhaki",
				"Gold",
				"Yellow",
				"Chocolate",
				"RosyBrown",
				"DarkGreen",
				"ForestGreen",
				"Olive",
				"LimeGreen",
				"MediumSeaGreen",
				"SpringGreen",
				"Chartreuse",
				"Teal",
				"LightSeaGreen",
				"DarkTurquoise",
				"Aquamarine",
				"MediumBlue",
				"DeepSkyBlue",
				"LightBlue",
				"Purple",
				"DarkViolet",
				"Fuchsia",
				"Orchid",
				"Plum",
			];
			const {
				DiscordSelectors,
				Settings,
				Tooltip
			} = { ...Api, ...BdApi };
			const { SettingPanel, SettingGroup, RadioGroup, Switch, Textbox } = Settings;


			const options = [
				{
					name: 'Encryption On',
					desc: 'Your messages will be encrypted.',
					value: 0
				},
				{
					name: 'Encryption Off',
					desc: 'Your messages will NOT be encrypted.',
					value: 1
				}
			];

			const worker = (stegCloakBlobURL) => {
				self.importScripts(stegCloakBlobURL);
				const stegCloak = new StegCloak();
				self.addEventListener("message", (evt) => {
					const data = evt.data;

					if (data.hide) {
						const stegCloakedMsg = (() => {
							try {
								return stegCloak.hide(data.hiddenMsg, data.password, data.coverMsg);
							} catch {
								return;
							}
						})();
						self.postMessage({
							id: data.id,
							hide: true,
							stegCloakedMsg,
						});
					} else if (data.reveal) {
						let usedPassword = "";


						const hiddenMsg = (() => {
							try {
								//\uFFFD = � --> wrong password
								let revealedMessage = "";
								revealedMessage = stegCloak.reveal(data.stegCloakedMsg, data.stegCloakedMsg.replace(data.stegCloakedMsg.replace(/[\u200C\u200D\u2061\u2062\u2063\u2064]*/, ""), ""));

								//check no password
								if (revealedMessage.endsWith("\u200b")) {
									//has indicator character
									return revealedMessage.slice(0, -1);
								}

								//check all other passwords
								for (var i = 0; i < data.passwords.length; i++) {
									revealedMessage = stegCloak.reveal(data.stegCloakedMsg, data.passwords[i]);
									if (revealedMessage.endsWith("\u200b")) {
										//has indicator character
										usedPassword = data.passwords[i];
										return revealedMessage.slice(0, -1);
									}
								}
							} catch {
								return;
							}
						})();
						self.postMessage({
							id: data.id,
							reveal: true,
							usedPswd: usedPassword,
							hiddenMsg,
						});
					}
				});
			};

			return class Apate extends Plugin {

				revealWorkers = [];
				hideWorker;
				lastWorkerId = 0;
				numOfWorkers = 16;

				default = {
					encryption: 1,
					deleteInvalid: true,
					ctrlToSend: true,
					animate: true,
					displayImage: false,
					password: "",
					passwords: [],
					passwordColorTable: ['white'],
					showLoading: true,
					showInfo: true,
					saveCurrentPassword: false,
					devMode: false
				};
				settings = null;


				addColor() {
					let newColor = colors[Math.floor(Math.random() * colors.length)];
					while (this.settings.passwordColorTable.some(e => e === newColor)) {
						newColor = colors[Math.floor(Math.random() * colors.length)];
					}
					this.settings.passwordColorTable.push(newColor);
				}
				addPasswordFromInput() {
					var candidate = document.getElementById("candidate");
					candidate.value = candidate.value.trim().replace(/[^a-zA-Z0-9\*\.!@#$%^&(){}\[\]:;<>,.?/~_+\-=|\\: ]*/g, "")
					if (this.settings.passwords.indexOf(candidate.value) !== -1) {
						BdApi.alert("Password already in list.", "This password is already in your list!");
						return;
					}
					if (this.settings.passwords.length >= 31) { //we dont count the first one 
						BdApi.alert("Too many passwords.", "You can only have 30 passwords in your list.");
						return;
					}
					if (candidate.value === "") {
						BdApi.alert("Invalid input.", "Please enter a valid password in the Textbox!");
						return;
					}

					this.settings.passwords.push(candidate.value);
					this.saveSettings(this.settings);
					this.updatePasswords();

				}
				addPassword(item) {
					var ul = document.getElementById("dynamic-list");
					var li = document.createElement("li");
					li.setAttribute('id', item);

					var copyButton = document.createElement("button");
					copyButton.textContent= `📋`
					copyButton.classList.add("btn-passwords");
					copyButton.setAttribute("title", "Copy Password")
					copyButton.addEventListener("click", () => {
						navigator.clipboard.writeText(item);
						BdApi.showToast("Copied password!", { type: "success" });
					});

					var revButton = document.createElement("button");
					revButton.textContent = `❌`
					revButton.classList.add("btn-passwords");
					revButton.setAttribute("title", "Remove Password")
					revButton.addEventListener("click", () => this.removePassword(item));

					if (this.settings.passwords[0] === item) {
						//first entry aka own password
						li.classList.add("ownPassword");
						if (this.settings.encryption === 1) {
							item = "-Encryption is off-";
						}

						li.appendChild(document.createTextNode("Own password: " + item));
						li.appendChild(copyButton);


					} else {
						li.classList.add("passwordLi")
						li.appendChild(document.createTextNode(item));


						li.appendChild(revButton);
						li.appendChild(copyButton);
					}
					let colorLen = this.settings.passwordColorTable.length;
					let passwordLen = this.settings.passwords.length;

					if (colorLen > passwordLen) {
						//need to remove colors
						for (var i = 0; i < colorLen - passwordLen; i++) {
							this.settings.passwordColorTable.pop();
						}
						this.saveSettings(this.settings);
					}
					if (colorLen < passwordLen) {
						//need to add colors
						for (var i = 0; i < passwordLen - colorLen; i++) {
							this.addColor()
						}
						this.saveSettings(this.settings);
					}

					let color = this.settings.passwordColorTable[this.settings.passwords.indexOf(item)]
					li.setAttribute('style', `color:${color}`);
					ul.appendChild(li);
				}
				removePassword(password) {
					if (this.settings.passwords.indexOf(password) !== -1) {
						let index = this.settings.passwords.indexOf(password)
						this.settings.passwords.splice(index, 1);
						this.settings.passwordColorTable.splice(index, 1);
					}
					this.saveSettings(this.settings);
					this.updatePasswords();
				}
				updatePasswords() {
					if (this.settings.passwords[0] !== this.settings.password) {
						if (this.settings.passwords.indexOf(this.settings.password) !== -1) {
							this.removePassword(this.settings.password);
						}
						if (!this.settings.saveCurrentPassword) {
							this.settings.passwords.shift();
						}
						this.settings.passwords.unshift(this.settings.password);
						this.saveSettings(this.settings);
					}
					var ul = document.getElementById("dynamic-list");
					ul.innerHTML = "";
					for (var i = 0; i < this.settings.passwords.length; i++) {
						this.addPassword(this.settings.passwords[i]);
					}
					let download = document.querySelector(".downloadListButton");
					if (download) {
						download.href = `data:application/xml;charset=utf-8,${encodeURIComponent(this.settings.passwords.join("\r\n"))}`;
					}
				}

				refreshCSS() {
					let animate = "";
					let noLoading = "";
					let info = "";
					if (this.settings.animate) {
						animate = apateAnimateCSS;
					}
					if (!this.settings.showLoading) {
						noLoading = apateNoLoadingCSS;
					}
					if (this.settings.simpleBackground) {
						BdApi.clearCSS("apateCSS");
						BdApi.injectCSS("apateCSS", apateSimpleCSS + animate + apatePasswordCSS + noLoading);
					}
					else {
						BdApi.clearCSS("apateCSS");
						BdApi.injectCSS("apateCSS", apateCSS + animate + apatePasswordCSS + noLoading);
					}
				}

				generatePassword(input) {
					const url = 'https://random-word-api.herokuapp.com/word?number=3';
					fetch(url)
						.then(data => { return data.json() })
						.then(res => {
							var result = res.join("_") + "_"
							var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*.!@#$%^&(){}[]:;<>.?/~_+-=|\\: ';
							var charactersLength = characters.length;

							var length = Math.random() * (40 - 15) + 15;
							for (var i = 0; i < length; i++) {
								result += characters.charAt(Math.floor(Math.random() * charactersLength));
							}
							input.value = result.substring(0, 50);
							this.settings.password = input.value;
							this.saveSettings(this.settings);
							this.updatePasswords();
						})
				}

				importPasswordList() {
					const fileInput = document.getElementById("file-input");
					if (fileInput.files.length === 0) {
						fileInput.addEventListener("change", fileUploaded, false);
						function fileUploaded() {
							//click again to notify importPasswordList
							document.querySelector(".uploadListButton").click();
							this.value = "";
						}
					}
					else {
						// file was successfully uploaded
						const file = fileInput.files[0];

						var fs = require("fs");
						var importedPasswords = fs.readFileSync(file.path, "utf-8").split("\n");

						BdApi.showConfirmationModal("Import List?", "Your entire password list and your password will be overriden! The first entry of your imported list will become your new password.", {
							confirmText: "Import",
							cancelText: "Cancel",
							danger: true,
							onConfirm: () => {
								let errorPasswords = [];
								if (importedPasswords.length > 31) {
									BdApi.alert("Too many passwords.", `The last ${importedPasswords.length - 31} passwords will not be added into your list.`);
									importedPasswords = importedPasswords.slice(0, 31);
								}
								this.settings.passwords = [];
								this.saveSettings(this.settings);
								for (var i = 0; i < importedPasswords.length; i++) {
									importedPasswords[i] = importedPasswords[i].trim().replace("\r\n", "");
									let correctPassword = importedPasswords[i].replace(/[^a-zA-Z0-9\*\.!@#$%^&(){}\[\]:;<>,.?/~_+\-=|\\: ]*/g, "");
									if (correctPassword !== importedPasswords[i]) {
										errorPasswords.push(importedPasswords[i]);
									}
									else {
										this.settings.passwords.push(importedPasswords[i]);
										this.saveSettings(this.settings);
									}
								}
								this.settings.password = this.settings.passwords[0];
								this.saveSettings(this.settings);
								this.updatePasswords();
								if (errorPasswords.length > 0) {
									BdApi.alert("Some passwords contained errors!", `Passwords: ${errorPasswords.join(", ")}`);
								}
								BdApi.showToast("Passwords imported!", { type: "success" });
							},
						});
					}
				}

				getSettingsPanel() {
					let passwordsGroup = new SettingGroup("Passwords");

					let doc = document.createElement("div");

					doc.innerHTML = ` <div class="input-group">
					 <input type="text" class="inputDefault-_djjkz input-cIJ7To form-control" id="candidate" required placeholder="password1234" maxlength="50">
					 <div class="input-group-append">
					   <button class="btn-add" type="button">Add Password</button>
					   <button class= "downloadListButton" onclick="document.getElementById('file-output').click();">Download Password List</button>
					   <a id="file-output" href="data:application/xml;charset=utf-8,${encodeURIComponent(this.settings.passwords.join("\r\n"))}" download="ApatePasswordList.txt"></a>
					   <button class="uploadListButton" onclick="document.getElementById('file-input').click();">Import Password List</button>
					   <input id="file-input" type="file" name="name" style="display: none;" accept=".txt"/>
 
					 </div>
				   </div>
				   <ul id="dynamic-list">
		   
		   
				   </ul>`;
					let addButton = doc.querySelector(".btn-add");
					let uploadButton = doc.querySelector(".uploadListButton");

					addButton.addEventListener("click", () => this.addPasswordFromInput());
					uploadButton.addEventListener("click", () => this.importPasswordList());




					let text = document.createElement("div");
					text.className = "colorStandard-2KCXvj size14-e6ZScH description-3_Ncsb formText-3fs7AJ modeDefault-3a2Ph1";
					text.textContent = `Here you can manage your passwords. Apate will go through every password and try to use it on a hidden message. 
										 The more passwords are in your list, the longer it will take to display every message. The higher up a password is, the more priority it has.`;
					passwordsGroup.append(
						doc,
						text,
					);
					passwordsGroup.getElement().addEventListener("click", () => this.updatePasswords());


					let textbox = document.createElement("div");
					textbox.innerHTML = ` <div class="input-group">
					 <input type="text" class="inputDefault-_djjkz input-cIJ7To form-control" id="candidateOwnPass" required placeholder="password1234" maxlength="50" title="Password">
					 <button class="btn-add" type="button">Generate Password</button>
 
 
				   </div>`
					addButton = textbox.querySelector(".btn-add")

					let textInput = textbox.querySelector("input");
					addButton.addEventListener("click", () => this.generatePassword(textInput));


					textInput.value = this.settings.password;
					textInput.addEventListener("change", () => {
						textInput.value = textInput.value.trim().replace(/[^a-zA-Z0-9\*\.!@#$%^&(){}\[\]:;<>.?/~_+\-=|\\: ]*/g, "");
						this.settings.saveCurrentPassword = false;
						this.settings.password = textInput.value;
						this.saveSettings(this.settings);
						this.updatePasswords();
					})

					let passwordTitle = document.createElement("h5");
					passwordTitle.classList = "colorStandard-2KCXvj size14-e6ZScH h5-18_1nd title-3sZWYQ defaultMarginh5-2mL-bP";
					passwordTitle.textContent = "Enter password:"

					let passwordSubTitle = document.createElement("div");
					passwordSubTitle.classList = "colorStandard-2KCXvj size14-e6ZScH description-3_Ncsb formText-3fs7AJ marginBottom8-AtZOdT modeDefault-3a2Ph1";
					passwordSubTitle.textContent = "If encryption is turned off this field will be ignored. Only characters a-Z, 0-9, space and special characters(:._, etc.). Tip: Right click the Key, to encrpyt a message with a certian password only once."


					return SettingPanel.build(() => this.saveSettings(this.settings),
						new Switch('Delete Invalid String', 'All text after the encrypted message will be invalid. Enabling this option will delete all invalid text when attempting to send.', this.settings.deleteInvalid, (i) => {
							this.settings.deleteInvalid = i;
							console.log(`Set "deleteInvalid" to ${this.settings.deleteInvalid}`);
						}),
						new Switch('Control + Enter to send', 'Enables the key combination CTRL+Enter to send your message with encryption.', this.settings.ctrlToSend, (i) => {
							this.settings.ctrlToSend = i;
							this.addKeyButton();
							console.log(`Set "ctrlToSend" to ${this.settings.ctrlToSend}`);
						}),
						new SettingGroup('Encryption').append(
							new RadioGroup('Encryption', `If encryption is turned on, all messages will be encrypted with the password defined below.`, this.settings.encryption || 0, options, (i) => {
								this.settings.encryption = i;
								console.log(`Set "encrpytion" to ${this.settings.encryption}`);
								this.updatePasswords();
							}),
							passwordTitle,
							textbox,
							passwordSubTitle
						),
						passwordsGroup,
						new SettingGroup('Display').append(
							new Switch('Animate', 'Choose whether or not Apate animations are displayed. (Key animation, emoji gif animation etc.)', this.settings.animate, (i) => {
								this.settings.animate = i;
								console.log(`Set "animate" to ${this.settings.animate}`);
								this.refreshCSS();
							}),
							new Switch('Simple Background', 'Removes the black background of encrypted messages.', this.settings.simpleBackground, (i) => {
								this.settings.simpleBackground = i;
								console.log(`Set "simpleBackground" to ${this.settings.simpleBackground}`);
								this.refreshCSS();
							}),
							new Switch('Display loading message', 'Show [loading hidden message...] whilst Apate checks if the password is correct', this.settings.showLoading, (i) => {
								this.settings.showLoading = i;
								this.refreshCSS();
							}),
							new Switch('Show info on click', 'Lets you click on messages to see the password that was used to decrypt it.', this.settings.showInfo, (i) => {
								this.settings.showInfo = i;
								this.refreshCSS();
							}),
							new Switch('Display Images.', 'Links to images will be displayed. All images get displayed by the images.weserv.nl image proxy.', this.settings.displayImage, (i) => {
								this.settings.displayImage = i;
								console.log(`Set "displayImage" to ${this.settings.displayImage}`);
							}),
						),
					);
				}
				async start() {
					{
						this.settings = this.loadSettings(this.default);



						for (const author of config.info.authors) {
							if (author.discord_id === BdApi.findModuleByProps('getCurrentUser').getCurrentUser()?.id) {
								this.settings.devMode = true;
							}
						}
						if (this.settings.devMode) {
							console.log(
								`%c\u2004\u2004\u2004%c\n%cMade By Aster & AGreenPig`,
								'font-size: 130px; background:url(https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo_dev.svg) no-repeat; backdround-size: contain;',
								``,
								`color: Orange; font-size: 1em; background-color: black; border: .1em solid white; border-radius: 0.5em; padding: 1em; padding-left: 1.6em; padding-right: 1.6em`,
							);
						}
						else {
							console.log(
								`%c\u2004\u2004\u2004%c\n%cMade By Aster & AGreenPig`,
								'font-size: 160px; background:url(https://raw.githubusercontent.com/TheGreenPig/Apate/main/Assets/logo.svg) no-repeat; backdround-size: contain;',
								``,
								`color: Orange; font-size: 1em; background-color: black; border: .1em solid white; border-radius: 0.5em; padding: 1em; padding-left: 1.6em; padding-right: 1.6em`,
							);
						}

					}

					{
						// Apate CSS
						this.refreshCSS();
					}

					{
						// key button
						this.addKeyButton();
					}

					{
						// workers
						const workerCode = worker.toString();

						const stegCloakBlobURL = URL.createObjectURL(new Blob([
							await (await window.fetch("https://raw.githubusercontent.com/KuroLabs/stegcloak/master/dist/stegcloak.min.js")).text()
						]));

						const discordEmojiModule = BdApi.findModule(m => m.Emoji && m.default.getByName).default;
						const emojiContainerClass = BdApi.findModule(m => Object.keys(m).length === 1 && m.emojiContainer).emojiContainer;

						for (let i in [...Array(this.numOfWorkers)]) {
							const worker = new window.Worker(URL.createObjectURL(new Blob(
								[`(${workerCode})(${JSON.stringify(stegCloakBlobURL)});`]
							)));

							worker.addEventListener("message", (evt) => {
								const data = evt.data;
								const messageContainer = document.querySelector(`[data-apate-id="${data.id}"]`);

								if (data.reveal && messageContainer && !messageContainer.hasAttribute("data-apate-hidden-message-revealed")) {
									const hiddenMessageDiv = messageContainer.querySelector(`.apateHiddenMessage`);

									if (data.hiddenMsg === "" || typeof data.hiddenMsg === 'undefined') {
										hiddenMessageDiv.remove();
									}

									hiddenMessageDiv.textContent = data.hiddenMsg;

									let urlRegex = /(https?:\/\/)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&/=\[\]]*)/g;
									let imageRegex = /(https?:\/\/)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&/=\[\]]*)\.(?:jpg|gif|png|jpeg|svg)/g;
									let emojiRegex = /\[[a-zA-Z_~\d+-ñ]+?:(\d+\.(png|gif)|default)\]/g; // +-ñ are for 3 discord default emojis (ñ for "piñata", + for "+1" and - for "-1")

									if (urlRegex.test(data.hiddenMsg)) {
										let linkArray = data.hiddenMsg.match(urlRegex);
										let hasImage = false;

										for (let i = 0; i < linkArray.length; i++) {
											if (imageRegex.test(linkArray[i]) && !hasImage && this.settings.displayImage) {
												//Message has image link
												let imageLink = new URL(linkArray[i]);

												let url;
												if (imageLink.hostname.endsWith("discordapp.net") || imageLink.hostname.endsWith("discordapp.com")) {
													url = imageLink.href;
												} else {
													url = `https://images.weserv.nl/?url=${encodeURIComponent(imageLink.href)}&n=-1`
												}

												imageLink.href = imageLink.href.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
												hiddenMessageDiv.textContent = hiddenMessageDiv.textContent.replace(imageLink.href, "");

												hiddenMessageDiv.appendChild(document.createElement("br"))
												
												let img = document.createElement("img");
												img.className = "apateHiddenImg";
												img.setAttribute("src", url);
												
												hiddenMessageDiv.appendChild(img);

												hasImage = true;
											}
											else {
												hiddenMessageDiv.innerHTML = hiddenMessageDiv.innerHTML.replace(linkArray[i],
													`<a class="anchor-3Z-8Bb anchorUnderlineOnHover-2ESHQB" 
													 title="${linkArray[i]}" 
													 href="${linkArray[i]}" 
													 rel="noreferrer noopener" 
													 target="_blank" 
													 role="button" 
													 tabindex="0"">
													 ${linkArray[i]}</a>`);
											}
										}
									}

									if (emojiRegex.test(data.hiddenMsg)) {
										for (let line of data.hiddenMsg.split("\\n")) {
											let emojiArray = line.match(emojiRegex);
											let bigEmoji = "";

											if (emojiArray === null) continue; // no emoji on this line

											//						remove the custom emoji	 remove the standart emoji
											let rest = line.replace(emojiRegex, "").replace(/[\\n ]/g, "").trim().replace("\u200B", "");
											if (rest.length === 0) {
												bigEmoji = "jumboable"
											}

											for (let i = 0; i < emojiArray.length; ++i) {
												let [emojiName, emojiId] = emojiArray[i].slice(1, emojiArray[i].length - 1).split(":");

												if (emojiId === "default") {
													let emoji = discordEmojiModule.getByName(emojiName);

													hiddenMessageDiv.innerHTML = hiddenMessageDiv.innerHTML.replace(emojiArray[i],
														`<span class="${emojiContainerClass}" tabindex="0">
															 <img aria-label="${emojiName}" src="${emoji.url}" alt=":${emojiName}:" class="emoji ${bigEmoji}">
															 </span>`);
												} else {
													if (!this.settings.animate) {
														emojiId = emojiId.replace(".gif", ".png")
													}

													hiddenMessageDiv.innerHTML = hiddenMessageDiv.innerHTML.replace(emojiArray[i],
														`<span class="${emojiContainerClass}" tabindex="0">
															 <img aria-label="${emojiName}" src="https://cdn.discordapp.com/emojis/${emojiId}?v=1" alt=":${emojiName}:" class="emoji ${bigEmoji}">
															 </span>`);
												}
											}
										}
									}

									hiddenMessageDiv.innerHTML = hiddenMessageDiv.innerHTML.replace(/\\n/g, '<br>');

									hiddenMessageDiv.classList.remove("loading");
									messageContainer.setAttribute("data-apate-hidden-message-revealed", "");


									if (this.settings.showInfo) {
										hiddenMessageDiv.addEventListener("click", () => {
											let passwordIndex = this.settings.passwords.indexOf(data.usedPswd);
											let color = this.settings.passwordColorTable[passwordIndex];
											if (passwordIndex > 1) {
												this.settings.passwords.splice(passwordIndex, 1);
												this.settings.passwordColorTable.splice(passwordIndex, 1);

												this.settings.passwords.splice(1, 0, data.usedPswd);
												this.settings.passwordColorTable.splice(1, 0, color);
												this.saveSettings(this.settings);
											}
											let style = ""


											if (data.usedPswd === "") {
												data.usedPswd = "-No Encryption-"
												passwordIndex = "-No Encryption-"
												style = `style="font-style: italic; font-size:1em;"`;
											} else {
												style = `style="color:${color}; font-size:0.9em;"`;

												var copyButton = document.createElement("button");
												copyButton.innerHTML = `📋`
												copyButton.classList.add("btn-passwords");
												copyButton.setAttribute("title", "Copy Password")
												copyButton.addEventListener("click", () => {
													navigator.clipboard.writeText(data.usedPswd);
													BdApi.showToast("Copied password!", { type: "success" });
												});
											}
											let htmlText = document.createElement("div");
											htmlText.innerHTML = `Password used: <b><div ${style}>${data.usedPswd}</div></b>`;
											htmlText.className = "markup-2BOw-j messageContent-2qWWxC";
											if (copyButton) {
												htmlText.querySelector("div").appendChild(copyButton);
											}

											BdApi.alert("Info", BdApi.React.createElement(HTMLWrapper, null, htmlText));
										})
									}
								}
							});

							this.revealWorkers.push(worker);
							URL.revokeObjectURL(worker);
						}

						this.hideWorker = new window.Worker(URL.createObjectURL(new Blob(
							[`(${workerCode})(${JSON.stringify(stegCloakBlobURL)});`]
						)));

						this.hideWorker.addEventListener("message", (evt) => {
							const data = evt.data;
							if (data.hide) {
								let output = "\u200B" + data.stegCloakedMsg;
								const textArea = document.querySelector(DiscordSelectors.Textarea.textArea.value);
								const editor = BdApi.getInternalInstance(textArea).return.stateNode.editorRef;

								editor.moveToRangeOfDocument();
								editor.delete();
								editor.insertText(output);

								const press = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", which: 13, keyCode: 13, bubbles: true });
								Object.defineProperties(press, { keyCode: { value: 13 }, which: { value: 13 } });
								window.setTimeout(() => textArea.children[0].dispatchEvent(press), 100);

								document.querySelector(".apateEncryptionKey")?.classList.remove("calculating");
							}
						});

					}
					URL.revokeObjectURL(this.hideWorker);
				};

				async hideMessage(password) {
					const textArea = document.querySelector(DiscordSelectors.Textarea.textArea.value);
					let input = await (async () => {
						const textSegments = textArea?.querySelectorAll(`div > div > span[data-slate-object]`);
						let input = "";
						let newLine = false;

						for (let textSegment of textSegments) {
							switch (textSegment.getAttribute("data-slate-object")) {
								case ("text"): {
									if (newLine) {
										input += "\n";
									}
									input += textSegment.textContent;
									newLine = true;
									break;
								}
								case ("inline"): {
									newLine = false;

									if (textSegment.querySelector("img.emoji")) {
										const emojiName = textSegment.querySelector("img.emoji")?.alt?.replace(/:/g, "");

										let emojiText = `:${emojiName}:`;

										if (input.includes("*")) {
											let emojiId = textSegment.querySelector("img").src.match(/emojis\/(?<id>\d+\.(png|gif))/)?.groups["id"];

											if (emojiId === undefined) { // emojiId is undefined when it's a discord default emoji
												emojiText = `[${emojiName}:default]`;
											} else {
												emojiText = `[${emojiName}:${emojiId}]`;
											}
										}


										if (!emojiText) return;

										input += emojiText;
									} else if (textSegment.querySelector("span.mention")) {
										input += textSegment.textContent;
									}
									break;
								}
							}
						}

						return input;
					})();

					if (!input) return;


					let RegExpGroups = (
						(/^(?<coverMessage>([^\*]*))\*(?<hiddenMessage>([^\*]+))\*(?<invalidEndString>(.*))$/)
							.exec(input.trim())?.groups
					);

					let coverMessage = RegExpGroups?.coverMessage?.trim();
					let hiddenMessage = RegExpGroups?.hiddenMessage?.trim();
					let invalidEndString = RegExpGroups?.invalidEndString?.trim();

					const editor = BdApi.getInternalInstance(textArea).return.stateNode.editorRef;

					if (!coverMessage) {
						BdApi.alert("Invalid input!", "The Cover message must have at least one non-whitespace character (This is to prevent spam). Synatax: `message *hiddenMessage*`");
						return;
					}
					//in case the user sends a one word cover message
					if (!coverMessage.includes(" ")) {
						coverMessage += " \u200b";
					}

					if (!hiddenMessage) {
						BdApi.alert("Invalid input!", "Something went wrong... Mark your hidden message with stars `*` like this: `message *hiddenMessage*`!");
						return;
					}
					if (invalidEndString) {
						BdApi.alert("Invalid input!", "There can't be a string after the hidden message! Syntax: `message *hiddenMessage*`");
						if (this.settings.deleteInvalid) {
							editor.moveToRangeOfDocument();
							editor.delete();
							editor.insertText(`${coverMessage}*${hiddenMessage}*`);
						}
						return;
					}


					editor.moveToRangeOfDocument();
					editor.delete();
					let pswd = ""
					if(typeof password !== "undefined" || password==="") {
						pswd = password;
					} 
					else {
						if (this.settings.encryption === 1) {
							pswd = this.getPassword();
							coverMessage = pswd + coverMessage;
						}
						else {
							pswd = this.settings.password;
						}
						this.settings.saveCurrentPassword = true;
						this.saveSettings(this.settings);
					}
					hiddenMessage = hiddenMessage.replace(/\r?\n/g, "\\n") //replace new line with actual \n
					hiddenMessage += "\u200b"; //used as a verification if the password was correct 

					document.querySelector(".apateEncryptionKey")?.classList.add("calculating");

					this.hideWorker?.postMessage({
						id: `apate-hide-${Date.now().toString(36)}`,
						hide: true,
						hiddenMsg: hiddenMessage,
						coverMsg: coverMessage,
						password: pswd
					});
				}
				getPassword() {
					//makes a 4 character Long password that gets added to the start of the cover Text for some encryption
					let password = "";
					let invisibleCharacters = ["\u200C", "\u200D", "\u2061", "\u2062", "\u2063", "\u2064"];
					for (var i = 0; i < 4; i++) {
						password += invisibleCharacters[(Math.floor(Math.random() * 6))];
					}
					return password;
				}

				addKeyButton() {

					const form = document.querySelector(DiscordSelectors.TitleWrap.form.value);

					if (!form || form.querySelector(".keyButton")) return;
					let button = document.createElement("div");
					if (form.querySelector(DiscordSelectors.Textarea.buttons) == null) {
						return;
					}

					form.querySelector(DiscordSelectors.Textarea.buttons).append(button);
					button.outerHTML = buttonHTML;
					button = form.querySelector(".keyButton");

					button.addEventListener("click", () => this.hideMessage());

					let tooptip = new Tooltip(button, "Right click to send with different Encryption!");

					button.addEventListener('hover', () => { tooptip.showAbove(); });

					button.addEventListener('contextmenu',  (ev) => {
						ev.preventDefault();
						BdApi.showConfirmationModal("Send message with different encryption?", "The password you choose will only be used on this message.", {
							confirmText: "Choose password",
							cancelText: "Cancel",
							onConfirm: () => {
								var ul = document.createElement("ul");
								var noEncrypt = document.createElement("li");
								noEncrypt.setAttribute('id', "");
								noEncrypt.classList.add("passwordLi");
								noEncrypt.textContent="-No Encryption-";
								noEncrypt.setAttribute('style', `color:SlateGray;`);

								if(this.settings.encryption===1) {
									noEncrypt.classList.add("selectedPassword");
								}
								noEncrypt.addEventListener("click", (e) => {
									ul.querySelector(".selectedPassword").classList.remove("selectedPassword");
									e.target.classList.add("selectedPassword");
								})

								ul.appendChild(noEncrypt)
								for(var i=0; i < this.settings.passwords.length; i++) {
									let item = this.settings.passwords[i]
									var li = document.createElement("li");
									li.setAttribute('id', item);
	
									li.classList.add("passwordLi")
									li.textContent = item;
				
									let color = this.settings.passwordColorTable[this.settings.passwords.indexOf(item)]
									if(i===0) {
										li.setAttribute('style', `color:SlateGray;`);
										if(this.settings.encryption===0) {
											li.classList.add("selectedPassword");
										}
									} else {
										li.setAttribute('style', `color:${color}`);
									}
									li.addEventListener("click", (e) => {
										ul.querySelector(".selectedPassword").classList.remove("selectedPassword");
										e.target.classList.add("selectedPassword");
									})
									ul.appendChild(li);
								}

								BdApi.showConfirmationModal("Choose password:", BdApi.React.createElement(HTMLWrapper, null, ul), {
									confirmText: "Send",
									cancelText: "Cancel",
									onConfirm: () => {
										let password = ul.querySelector(".selectedPassword").id;
										this.hideMessage(password)
									}
								});
							},

						});
						return false;
					}, false);

					if (this.settings.ctrlToSend) {

						form.addEventListener("keyup", (evt) => {
							if (evt.key === "Enter" && evt.ctrlKey) {
								evt.preventDefault();
								this.hideMessage();
							}
						});
					}

				};

				addHiddenMessageBanners() {
					const messageContainers = document.querySelectorAll(
						`${DiscordSelectors.TitleWrap.chatContent.value
						} div[data-list-id="chat-messages"] > div[class*="message-"]:not([data-apate-seen])`
					);

					if (!messageContainers || !this.revealWorkers.length) return;

					const randomStr = Math.floor(Math.random() * 1e16).toString(36);
					const timeStr = Date.now().toString(36);

					for (const [i, messageContainer] of [...messageContainers].reverse().entries()) {
						messageContainer.setAttribute("data-apate-seen", "");

						const domMessage = messageContainer.querySelector(
							`div[class*="contents-"][role="document"] > div[class*="markup-"][class*="messageContent-"]`
						).cloneNode(true);

						const messageEmojis = domMessage.querySelectorAll(`span[class*="emojiContainer-"]`);

						for (let emoji of messageEmojis) {
							emoji.innerHTML = emoji.children[0].alt;
						}

						const textContent = domMessage.textContent;

						if (textContent?.startsWith("\u200b") && !messageContainer.hasAttribute("data-apate-contains-hidden-message")) {
							const id = `apate-${timeStr}-${randomStr}-${i}`;

							messageContainer.setAttribute("data-apate-contains-hidden-message", "");
							messageContainer.setAttribute("data-apate-id", id);

							let pswd = this.settings.passwords;
							let hiddenCloak = textContent.replace(/^\u200b/, "")

							this.revealWorkers[this.lastWorkerId]?.postMessage({
								id,
								reveal: true,
								stegCloakedMsg: hiddenCloak,
								passwords: pswd,
							});
							this.lastWorkerId++;
							this.lastWorkerId %= this.numOfWorkers;
							{
								const messageWrapper = messageContainer.querySelector(`div[role="document"]`);

								let hiddenMessageDiv = document.createElement("div");
								hiddenMessageDiv.classList.add("apateHiddenMessage", "loading");
								messageWrapper.append(hiddenMessageDiv);

							}
						}
					}
				};
				observer(mutationRecord) {
					if (!mutationRecord.addedNodes) return;
					this.addHiddenMessageBanners();
					this.addKeyButton();
				};
				stop() {
					for (const worker of this.revealWorkers) {
						worker.terminate();
					}
					BdApi.clearCSS("apateCSS");
				};
			};
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
