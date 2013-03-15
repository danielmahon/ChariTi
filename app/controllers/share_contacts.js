var APP = require("core");

var CONFIG = arguments[0];
var SELECTED = [];

$.init = function() {
	APP.log("debug", "share_contacts.init | " + JSON.stringify(CONFIG));

	if(Ti.Contacts.contactsAuthorization == Ti.Contacts.AUTHORIZATION_AUTHORIZED) {
		$.loadData();
	} else if(Ti.Contacts.contactsAuthorization == Ti.Contacts.AUTHORIZATION_UNKNOWN) {
		Ti.Contacts.requestAuthorization(function(_event) {
			if(_event.success) {
				$.loadData();
			} else {
				$.createEmail();
			}
		});
	} else {
		$.createEmail();
	}

	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary || "#000");

	if(APP.Device.isHandheld) {
		$.NavigationBar.showBack();
	}

	if(APP.Settings.useSlideMenu) {
		$.NavigationBar.showMenu();
	}

	$.NavigationBar.showRight({
		image: "/images/next.png",
		callback: function() {
			$.createEmail(SELECTED);
		}
	});
};

$.loadData = function() {
	APP.log("debug", "share_contacts.loadData");

	var contacts = $.getContacts();
	var emails = $.getEmails(contacts);
	var rows = [];

	for(var i = 0, x = emails.length; i < x; i++) {
		var row = Alloy.createController("share_contacts_row", {
			id: emails[i].email,
			heading: emails[i].name,
			subHeading: emails[i].email
		}).getView();

		rows.push(row);
	}

	$.content.setData(rows);
};

$.getContacts = function() {
	APP.log("debug", "share_contacts.getAddresses");

	var items = Ti.Contacts.getAllPeople();
	var contacts = [];

	for(var i = 0, x = items.length; i < x; i++) {
		var person = items[i];

		if(person.email) {
			contacts.push({
				name: person.fullName,
				email: person.email
			});
		}
	}

	contacts.sort(function(a, b) {
		a = a.name.toLowerCase();
		b = b.name.toLowerCase();

		if(a < b) {
			return -1;
		} else if(a > b) {
			return 1;
		} else {
			return 0;
		}
	});

	return contacts;
};

$.getEmails = function(_contacts) {
	var emails = [];

	for(var i = 0, z = _contacts.length; i < z; i++) {
		var contact = _contacts[i];

		for(var type in contact.email) {
			emails.push({
				name: contact.name,
				email: contact.email[type][0]
			});
		}
	}

	return emails;
};

$.createEmail = function(_addresses) {
	APP.log("debug", "share_contacts.createEmail");

	var email = Ti.UI.createEmailDialog();

	if(_addresses) {
		email.bccRecipients = _addresses;
	}

	email.html = true;
	email.messageBody = CONFIG.text;

	email.addEventListener("complete", function(_event) {
		APP.removeAllChildren();
	});

	email.open();
};

// Event listeners
$.content.addEventListener("click", function(_event) {
	APP.log("debug", "share_contacts @click " + _event.row.id);

	if(SELECTED.indexOf(_event.row.id) === -1) {
		SELECTED.push(_event.row.id);
	} else {
		SELECTED.splice(SELECTED.indexOf(_event.row.id), 1);
	}
});

// Kick off the init
$.init();