Template.chatTextArea.helpers({
    callbacks: function () {
        return {
            finished: function (index, fileInfo, context) {
                fileInfo.dialogId = IM.getCurrentDialogId();
                Meteor.call("saveUploadedFileMeta", fileInfo, GlobalUI.generalCallback(function(id){
                    var attachmentIds = IM.getMessageAttachmentsDraft();
                    !attachmentIds && (attachmentIds = []);
                    attachmentIds.push({id: id});
                    IM.updateMessageAttachmentsDraft(attachmentIds);
                }))
            }
        }
    },
    attachmentIds: function () {
        return IM.getMessageAttachmentsDraft();

    }
});

Template.chatTextArea.rendered = function () {
    //this is for @mentions
    var self = this;
    self.$newMessageForm = self.$('#chat-message-form');
    self.$textarea = self.$newMessageForm.find('textarea');
    this.autorun(function () {
        var users = Meteor.users.find({}).fetch();
        self.suggestionsMap = {};
        self.suggestions = _.map(users, function (user) {
            var key = "@" + Utils.getUsername(user);
            self.suggestionsMap[key] = user;
            return key;
        });
        self.suggestions.push("@all");
        self.suggestionsMap["@all"] = {_id: "all"};
        self.suggestions.push("@All");
        self.suggestionsMap["@All"] = {_id: "all"};
        self.$textarea.asuggest(self.suggestions);
    });
//=========================
    self.sendMessage = function () {
        IM.updateMessageTextDraft(self.$textarea.val());
        var suggestions = self.suggestions;
        var suggestionsMap = self.suggestionsMap;
        var attachmentIds = IM.getMessageAttachmentsDraft();
        var text = IM.getMessageTextDraft();
        var mentions = [];
        if(text) {
            suggestions.forEach(function (s) {
                var mentionSubject = suggestionsMap[s]._id;
                var regexp = new RegExp(s, "g");
                if (text.match(regexp)) {
                    mentions.push({text: s, id: mentionSubject})
                }
            });
        }
        Meteor.call('sendMessage',
            text,
            attachmentIds,
            mentions,
            IM.getCurrentDialog()._id,
            GlobalUI.generalCallback(function(){
                IM.updateMessageTextDraft("");
                IM.updateMessageAttachmentsDraft([]);
                self.$textarea.val("")
            }));
    }
    //=========================
    this.autorun(function () {
        if(IM.getCurrentDialogId()){
            self.$textarea.val(IM.getMessageTextDraft())
        }
    });
}
Template.chatTextArea.events({
    "input #chat-message-form textarea": function (e, t) {
        var $textarea = t.$(e.currentTarget);
        var text = $textarea.val();
        IM.updateMessageTextDraft(text);
    },
    "keydown #chat-message-form textarea": function (e, t) {
        var $textarea = t.$(e.currentTarget);
        var text = $textarea.val();
        var attachments = IM.getMessageAttachmentsDraft() || [];
        if (e.keyCode === 13 && (text.trim()  !== "" || attachments.length)) {
            e.preventDefault();
            Template.instance().sendMessage(text);
        }
    },
    "click .btn-send": function (e, t) {
        var $textarea = t.$('#chat-message-form textarea');
        var text = $textarea.val();
        if ((text.trim()  !== "" || attachments.length)) {
            e.preventDefault();
            Template.instance().sendMessage(text);
        }
    },
    "click .btn-attach": function (e, t) {
        //t.$(".upload-control.start").click()
        //t.$(".upload-control.leftButton").click()
    }
});