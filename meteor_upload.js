Items = new Mongo.Collection('items');
Uploads = new Mongo.Collection('uploads');
Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {
  Meteor.startup(function() {
   Uploader.finished = function(index, fileInfo, templateContext) {
   var xx =    Uploads.insert(fileInfo);
    console.log(fileInfo['url']); 
   Session.set('image_url', fileInfo['url']);
   Session.set('image', xx);
   }
  });

  // counter starts at 0
  Session.setDefault('counter', 0);
  Session.setDefault('image', '');
  
  Template.body.helpers({
    tasks: function () {
      return Tasks.find({}, {sort: {createdAt: -1}});
    },
    images: function () {
        // Otherwise, return all of the tasks
    console.log('wooooooot'); 
        return Uploads.find({_id : Session.get('image')});
    }
  });
  Template.body.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      var title = event.target.title.value;

      Tasks.insert({
        title: title,
        createdAt: new Date(), 
        image: Session.get('image_url'),
      });
      event.target.title.value = "";
    }
  });

  Template.hellot.helpers({
    myFormData: function() {
      return { directoryName: 'images', prefix: this._id, _id: this._id }
    },
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  // init items collection
  if (Items.find().count() == 0) {
    Items.insert({name: 'My Item', uploads: []});
  }

  UploadServer.init({
    tmpDir: process.env.PWD + '/.uploads/tmp',
    uploadDir: process.env.PWD + '/.uploads/',
    checkCreateDirectories: true,
    getDirectory: function(fileInfo, formData) {
      if (formData && formData.directoryName != null) {
        return formData.directoryName;
      }
      return "";
    },
    getFileName: function(fileInfo, formData) {
      if (formData && formData.prefix != null) {
        return formData.prefix + '_' + fileInfo.name;
      }
      return fileInfo.name;
    },
    finished: function(fileInfo, formData) {
      if (formData && formData._id != null) {
        Items.update({_id: formData._id}, { $push: { uploads: fileInfo }});
      }
    }
  });
});

}
