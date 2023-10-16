import { VBotClient } from "./vbot-sdk.js";
import { Autoplay } from "./vbot-sdk.js";
import  {Features}  from "./vbot-sdk.js";
import { Media } from "./vbot-sdk.js";
import { Sound } from "./vbot-sdk.js";
import { log } from "./vbot-sdk.js";
var clientCall;
var sessionCall;

function AcceptToken() {
    var token = document.getElementById("tokenUser").value;
    startConnect(token);

  }
  document.getElementById('acceptedToken').addEventListener('click', AcceptToken);

async function startConnect(tokenUser){
   var client = await VBotClient(tokenUser);
   CallIncoming(client);
   clientCall = client;
   client.on("statusUpdate", function (status) {
     // logger.info(`Trạng thái tài khoản đã thay đổi thành ${status}`);
     document.getElementById('debug-console').value += `Trạng thái tài khoản đã thay đổi thành ${status} \n`;
    //  console.log(`Trạng thái tài khoản đã thay đổi thành ${status}`);          
   });      
   client.connect();      
   selectHotline(client);
   selectDeviceInput();
   selectDeviceOutput();
   
 }

 async function selectHotline(client){
    var sel = document.createElement('select');
    sel.name = 'selectHotline';
    sel.id = 'selectHotline';
    const hotlines = await client.getHotlines();
    var options_str = "";

     hotlines.forEach( function(hotline) {
     
      options_str += '<option value="' + hotline.phoneNumber + '">' + hotline.name + '</option>';
    });

    sel.innerHTML = options_str;
    document.getElementById('selectHotline').replaceWith(sel);

  }

 async function doCall(){
    try {
      
      var phoneNumber = document.getElementById('phoneNumber').value;
      var hotlineNumber = document.getElementById('selectHotline').value;      
// Khoi tao cuoc goi
// phoneNumber: So dien thoai
// hotlineNumber: So hotline

const session = await clientCall
  .invite(phoneNumber, hotlineNumber)
  .catch();
sessionCall = session;
statusCall(session);

document.getElementById('debug-console').value += `Call outgoing` +'\xa0'+ 'phoneNumber:'+'\xa0'+phoneNumber+'\xa0'+'hotline:'+'\xa0'+hotlineNumber + '\n';

if (!session) {  
  return;
}

// show progress dang thuc hien cuoc goi
// showOutgoingCallProgressHub();

let { accepted, rejectCause } = await session.accepted(); // wait until the call is picked up
if (!accepted) {
  // show nguyen nhan cuoc goi bi rejected
  // showCallRejectedScreen(rejectCause);
  return;
}

// show man hinh cuoc goi
// showCallScreen();

// cuoc goi ket thuc
await session.terminated(); // wait until the call is terminated
} catch (e) {
    console.log(e);
}
  }

  document.getElementById('call-btn').addEventListener('click', doCall);


function CallIncoming(client){
    client.on('invite', async(session) => {
        try {
              // Do chuong cuoc goi
          // ringer();
          document.getElementById('debug-console').value += `Call incoming` +'\xa0'+session.phoneNumber +'\n';
          sessionCall = session;
          statusCall(session);
      
          let { accepted, rejectCause } = await session.accepted(); // wait until the call is picked up
          if (!accepted) {
            return;
          }
      
              // show man hinh cuoc goi
          // showCallScreen();
      
              // cuoc goi ket thuc
          await session.terminated(); // wait until the call is terminated
        } catch (e) {
          console.log(e);
        } finally {
              // Dong man hinh cuoc goi
          // closeCallScreen();
        }
      });
  }

function statusCall(session){

  session.on("statusUpdate", function (status) {
    
    document.getElementById('debug-console').value += `Trạng thái của cuộc gọi đã thay đổi thành ${status}`+'\n';
  });
  
}

async function AcceptIncomingCall(){
  try{
    
    await sessionCall.accept();
    document.getElementById('debug-console').value += `Call Accept ! \n`;
  }
  catch(e){
    console.log(e);
  }
}

document.getElementById('accecpt-call-btn').addEventListener('click', AcceptIncomingCall);

async function RejectIncomingCall(){
  try{
    await sessionCall.reject();
    document.getElementById('debug-console').value += `Call Reject ! \n`;
  }
  catch(e){
    console.log(e);
  }
}

document.getElementById('reject-call-btn').addEventListener('click', RejectIncomingCall);

async function TerminateCall(){
  try{
      
    await sessionCall.terminate();
    document.getElementById('debug-console').value += `Call Terminate ! \n`;
  }
  catch(e){
    console.log(e);
  }
}

document.getElementById('terminate-call-btn').addEventListener('click', TerminateCall);

async function CancelOutGoingCall(){
  try{
    await sessionCall.cancel();
    document.getElementById('debug-console').value += `Call Cancel ! \n`;
  }
  catch(e){
    console.log(e);
  }
}
document.getElementById('cancel-call-btn').addEventListener('click', CancelOutGoingCall);

async function HoldCall(){
  try{
    await sessionCall.hold();
    document.getElementById('debug-console').value += `Call Hold ! \n`;
  }
  catch(e){
    console.log(e);
  }
}

document.getElementById('hold-call-btn').addEventListener('click', HoldCall);

async function UnholdCall(){
  try{
    await sessionCall.unhold();
    document.getElementById('debug-console').value += `Call Unhold ! \n`;
  }
  catch(e){
    console.log(e);
  }
}

document.getElementById('unhold-call-btn').addEventListener('click', UnholdCall);

document.getElementById('mic-mute').addEventListener('change', function() {
  if (this.checked) {
    sessionCall.media.input.muted = true;
    document.getElementById('debug-console').value += `Micro Muted ! \n`;
  } else {
    sessionCall.media.input.muted = false;
    document.getElementById('debug-console').value += `Micro Unmuted ! \n`;
  }
});

function sendDTMF(){
  var val = document.getElementById('dtmf-input').value;
  sessionCall.dtmf(val);

}

document.getElementById('send-dtmf-btn').addEventListener('click', sendDTMF);

function changeVolume(val){
  
  sessionCall.media.input.volume = val;
  document.getElementById('debug-console').value += `Volume change to ${val} \n`;
}

document.getElementById('volume-range').addEventListener('change',  function() {changeVolume(document.getElementById('volume-range').value)});



function selectDeviceInput(){
  var selD = document.createElement('select');
    selD.name = 'selectDeviceInput';
    selD.id = 'selectDeviceInput';
    var options_strD = "";
  if (!navigator.mediaDevices?.enumerateDevices) {
    console.log("enumerateDevices() not supported.");
  } else {
    // List cameras and microphones.
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        var devicesInput = devices.filter(device => device.kind=='audioinput');
        devicesInput.forEach((deviceI) => {
          
          options_strD += '<option value="' + deviceI.deviceId + '">' + deviceI.label + '</option>';
        });
        selD.innerHTML = options_strD;
        document.getElementById('selectDeviceInput').replaceWith(selD);
        document.getElementById('selectDeviceInput').addEventListener('change',  function() {changeInputDevice(document.getElementById('selectDeviceInput').value)});
            })
      .catch((err) => {
        console.error(`${err.name}: ${err.message}`);
      });
  }
}

function selectDeviceOutput(){
  var selDO = document.createElement('select');
  selDO.name = 'selectDeviceOutput';
  selDO.id = 'selectDeviceOutput';
    var options_strDO = "";
  if (!navigator.mediaDevices?.enumerateDevices) {
    console.log("enumerateDevices() not supported.");
  } else {
    // List cameras and microphones.
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        var devicesOutput = devices.filter(device => device.kind=='audiooutput');
        devicesOutput.forEach((deviceO) => {
          
          options_strDO += '<option value="' + deviceO.deviceId + '">' + deviceO.label + '</option>';
        });
        selDO.innerHTML = options_strDO;
        document.getElementById('selectDeviceOutput').replaceWith(selDO);
        document.getElementById('selectDeviceOutput').addEventListener('change',  function() {changeOutputDevice(document.getElementById('selectDeviceOutput').value)});
        })
      .catch((err) => {
        console.error(`${err.name}: ${err.message}`);
      });
  }
}

function changeInputDevice(deviceId){
  document.getElementById('debug-console').value += `Input device id` + '\xa0'+ deviceId +'\n';
  clientCall.defaultMedia.input.id = deviceId;
}



function changeOutputDevice(deviceId){
  document.getElementById('debug-console').value += `Output device id` + '\xa0'+ deviceId +'\n';
  clientCall.defaultMedia.output.id = deviceId;
}
