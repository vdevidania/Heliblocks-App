const functions = require("firebase-functions");
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");
const serviceAccount = require("./config/serviceAccountKey.json");
const {
  algolia_app_id,
  algolia_api_key,
  algolia_index_name
} = require("./config/algoliaConfig.json");

const algoliaClient = algoliasearch(  algolia_app_id, algolia_api_key);
const algoliaIndex = algoliaClient.initIndex(algolia_index_name);
const Heliblock = require("./services/heliblock");
const screenshot = require("./services/screenshot");
const previewGenerator = require("./services/preview-generator");
const sanitize = require("./services/sanitize");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://heliblocks.firebaseio.com",
  storageBucket: "heliblocks.appspot.com"
});

const db = admin.firestore();
db.settings({ timestampsInSnapshots: true });
const refHeliblocks = db.collection("heliblocks");
const refUsers = db.collection("users");
const bucket = admin.storage().bucket();

exports.generateScreenshot = functions.firestore
  .document("heliblocks/{id}")
  .onWrite(async (change, context) => {
    // Exit when the data is deleted.
    if (!change.after.exists) {
      return null;
    }

    const { html, css, alignment, additionalLinks } = change.after.data();

    const preview = previewGenerator({
      html: sanitize(html),
      css,
      alignment,
      additionalLinks
    });

    const { id } = context.params;

    const imageBuffer = await screenshot(preview);
    const file = bucket.file(`/screenshots/${id}.png`);
    await file.save(imageBuffer);

    const url = await file.getSignedUrl({
      action: "read",
      expires: "03-09-2491"
    });

    return refHeliblocks.doc(id).update({ screenshot: url[0] });
  });

exports.addToAlgolia = functions.firestore
  .document("heliblocks/{id}")
  .onWrite(async (change, context) => {
    // Exit when the data is deleted.
    if (!change.after.exists) {
      return null;
    }

    const content = change.after.data();

    // Exit when does not exit screenshot
    if (!content.screenshot) {
      return null;
    }

    const heliblock = new Heliblock({
      ...content,
      html: sanitize(content.html),
      css: content.css
    });

    const snapshotAuthor = await db
      .collection("users")
      .doc(content.author)
      .get();
    if (snapshotAuthor.exists) {
      heliblock.setAuthor({
        id: content.author,
        displayName: snapshotAuthor.data().displayName,
        photoURL: snapshotAuthor.data().photoURL
      });
    }

    const publicHeliblock = heliblock.getPublic();

    return algoliaIndex.addObject({
      objectID: context.params.id,
      ...publicHeliblock
    });
  });

exports.removeCreation = functions.firestore
  .document("heliblocks/{id}")
  .onDelete(async (snapshot, context) => {
    const { screenshot, author } = snapshot.data();
    const { id } = context.params;

    if (screenshot) {
      await bucket.file(`/screenshots/${id}.png`).delete();
    }

    if (author) {
      refUsers.doc(author).update({
        heliblocks: admin.firestore.FieldValue.arrayRemove(id)
      });
    }

    return algoliaIndex.deleteObject(id);
  });
