// @flow
import m from "mithril"
import {lang} from "../misc/LanguageViewModel"
import {assertMainOrNode} from "../api/Env"
import {TextField} from "../gui/base/TextField"
import {Dialog} from "../gui/base/Dialog"
import {Button} from "../gui/base/Button"
import {worker} from "../api/main/WorkerClient"
import {fileController} from "../file/FileController"
import {utf8Uint8ArrayToString} from "../api/common/utils/Encoding"
import {InvalidDataError} from "../api/common/error/RestError"
import {DropDownSelector} from "../gui/base/DropDownSelector"
import {BootIcons} from "../gui/base/icons/BootIcons"

assertMainOrNode()

/**
 * @pre: customerInfo.domainInfos.length > 0
 */
export function show(customerInfo: CustomerInfo): void {
	// only show a dropdown if a domain is already selected for tutanota login or if there is exactly one domain available
	let selectedDomainInfo = customerInfo.domainInfos.find(info => info.certificate != null)
	if (customerInfo.domainInfos.length == 1) {
		selectedDomainInfo = customerInfo.domainInfos[0]
	}
	let domainField
	if (selectedDomainInfo) {
		domainField = new TextField("brandingDomain_label").setValue(selectedDomainInfo.domain).setDisabled()
	} else {
		let availableItems = customerInfo.domainInfos.map(info => {
			return {name: info.domain, value: info}
		})
		domainField = new DropDownSelector("brandingDomain_label", null, availableItems, availableItems[0].value, 250)
	}

	let certChainFile: ?DataFile = null
	let certificateChainField = new TextField("certificateChain_label", () => lang.get("certificateChainInfo_msg")).setValue("").setDisabled()
	let chooseCertificateChainButton = new Button("edit_action", () => {
		fileController.showFileChooser(false).then(files => {
			certChainFile = files[0]
			certificateChainField.setValue(certChainFile.name)
			m.redraw()
		})
	}, () => BootIcons.Edit)
	certificateChainField._injectionsRight = () => [m(chooseCertificateChainButton)]

	let privKeyFile: ?DataFile = null
	let privateKeyField = new TextField("privateKey_label", () => lang.get("privateKeyInfo_msg")).setValue("").setDisabled()
	let choosePrivateKeyButton = new Button("edit_action", () => {
		fileController.showFileChooser(false).then(files => {
			privKeyFile = files[0]
			privateKeyField.setValue(privKeyFile.name)
			m.redraw()
		})
	}, () => BootIcons.Edit)
	privateKeyField._injectionsRight = () => [m(choosePrivateKeyButton)]

	let form = {
		view: () => {
			return [
				m(domainField),
				m(certificateChainField),
				m(privateKeyField),
			]
		}
	}
	let dialog = Dialog.smallActionDialog(lang.get("brandingDomain_label"), form, () => {
		if (!certChainFile) {
			Dialog.error("certificateChainInfo_msg")
		} else if (!privKeyFile) {
			Dialog.error("privateKeyInfo_msg")
		} else {
			try {
				let domain = (domainField instanceof TextField) ? domainField.value() : domainField.selectedValue().domain
				worker.uploadCertificate(domain, utf8Uint8ArrayToString(certChainFile.data), utf8Uint8ArrayToString(privKeyFile.data)).then(() => {
					dialog.close()
				}).catch(InvalidDataError, e => {
					Dialog.error("certificateError_msg")
				})
			} catch (e) {
				Dialog.error("certificateError_msg")
			}
		}
	})
}
