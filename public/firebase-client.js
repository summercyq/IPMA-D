import {sameDocument} from './progress-core.js?v=bec41f02356c';
// Firebase web configuration is public; access is protected by Authentication and Firestore rules.
export const firebaseConfig={
 apiKey:'AIzaSyBpfmexJxuENbDJzVnORYzENum86-7Kt6w',
 authDomain:'ipma-d.firebaseapp.com',
 projectId:'ipma-d',
 storageBucket:'ipma-d.firebasestorage.app',
 messagingSenderId:'437778289005',
 appId:'1:437778289005:web:cbcf2556e2f1c5fce6ca64'
};
export async function createFirebaseBackend(){
 const sdk=await import('./vendor/firebase.js?v=bec41f02356c');
 const appSDK=sdk,authSDK=sdk,dbSDK=sdk;
 const app=appSDK.initializeApp(firebaseConfig),auth=authSDK.getAuth(app),db=dbSDK.getFirestore(app);
 auth.languageCode='zh-TW';
 const reference=uid=>dbSDK.doc(db,'progress',uid);
 return {
  onAuth:callback=>authSDK.onAuthStateChanged(auth,callback),
  login:()=>authSDK.signInWithPopup(auth,new authSDK.GoogleAuthProvider()),
  logout:()=>authSDK.signOut(auth),
  watch:(uid,callback,onError)=>dbSDK.onSnapshot(reference(uid),snapshot=>callback(snapshot.exists()?snapshot.data():null),onError),
  transact:(uid,merge)=>dbSDK.runTransaction(db,async transaction=>{
   const ref=reference(uid),snapshot=await transaction.get(ref);const merged=merge(snapshot.exists()?snapshot.data():null);
   if(!snapshot.exists()||!sameDocument(snapshot.data(),merged))transaction.set(ref,{...merged,updatedAt:dbSDK.serverTimestamp()});return merged;
  })
 };
}
