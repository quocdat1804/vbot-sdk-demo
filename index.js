import { VBotClient } from "./vbot.js";

var clientCall;
var sessionCall;
var tokenElement = document.getElementById("tokenUser");
var acceptedTokenElement = document.getElementById("acceptedToken")
function AcceptToken() {
  var token = tokenElement.value;
  startConnect(token);

}
acceptedTokenElement.addEventListener("click", AcceptToken);

async function startConnect(tokenUser) {
  var client = await VBotClient(tokenUser);
  AnswerIncomingCall(client);
  clientCall = client;
  statusConnect(client);
  client.connect();
  selectHotline(client);
  selectDeviceInput();
  selectDeviceOutput();

}

function statusConnect(client) {
  client.on("statusUpdate", function (status) {

    document.getElementById("debug-console").value += `Trạng thái tài khoản đã thay đổi thành ${status} \n`;

  });

  client.on("numberFromDialpad", function (phoneNumber, hotline) {

    document.getElementById("debug-console").value += `Gọi từ bàn phím: Hotline ${hotline} Số điện thoại ${phoneNumber}\n`;
    makeCall(phoneNumber, hotline);
  });
}

async function selectHotline(client) {
  var sel = document.createElement("select");
  sel.name = "selectHotline";
  sel.id = "selectHotline";
  const hotlines = await client.getHotlines();
  var options_str = "";

  hotlines.forEach(function (hotline) {

    options_str += "<option value=" + hotline.phoneNumber + ">" + hotline.name + "</option>";
  });

  sel.innerHTML = options_str;
  if (document.getElementById("typeCall").value == "hotlineCall") {
    document.getElementById("selectHotline").replaceWith(sel);
  }


}

async function makeCall(phone, hotline) {
  try {
    var phoneNumber = "";
    var hotlineNumber = "";
    if (phone == null) {
      phoneNumber = document.getElementById("phoneNumber").value;
      hotlineNumber = document.getElementById("selectHotline").value;
    } else {
      phoneNumber = phone;
      hotlineNumber = hotline;
    }

    var memberBranch = document.getElementById("memberBranch").value;
    document.getElementById("callOut-info").innerHTML = "Đang gọi tới" + "\xa0" + phoneNumber;

    const session = document.getElementById("typeCall").value == "hotlineCall"
      ? await clientCall.invite(phoneNumber, hotlineNumber).catch()
      : await clientCall.invite(memberBranch).catch();

    document.getElementById("call-btn").hidden = true;
    document.getElementById("cancel-call-btn").hidden = false;

    sessionCall = session;
    statusCall(session);

    document.getElementById("typeCall").value == "hotlineCall"
      ? document.getElementById("debug-console").value += `Call outgoing` + "\xa0" + "phoneNumber:" + "\xa0" + phoneNumber + "\xa0" + "hotline:" + "\xa0" + hotlineNumber + "\n"
      : document.getElementById("debug-console").value += "Call outgoing" + "\xa0" + "memberBranch:" + "\xa0" + memberBranch + "\n";
    if (!session) {
      return;
    }
    waitAcceptSession(session);
    let { accepted, rejectCause } = await session.accepted();

    if (!accepted) {
      document.getElementById("call-btn").hidden = false;
      document.getElementById("cancel-call-btn").hidden = true;
      document.getElementById("callOut-info").innerHTML = "";
    }
    else {
      document.getElementById("cancel-call-btn").hidden = true;
      document.getElementById("hold-call-btn").hidden = false;
      document.getElementById("unhold-call-btn").hidden = false;
      document.getElementById("terminate-call-btn").hidden = false;
    }

    await session.terminated();

    document.getElementById("call-btn").hidden = false;
    document.getElementById("callOut-info").innerHTML = "";
    document.getElementById("hold-call-btn").hidden = true;
    document.getElementById("unhold-call-btn").hidden = true;
    document.getElementById("terminate-call-btn").hidden = true;
  } catch (e) {
    console.log(e);
  }
}

document.getElementById("call-btn").addEventListener("click", makeCall);
document.getElementById("dialpad-btn").addEventListener("click", openDialpad);

var show = true;
function openDialpad() {
  show = !show;
  clientCall.showDialpad(show);
}


function AnswerIncomingCall(client) {
  client.on("invite", async (session) => {
    try {

      document.getElementById("accecpt-call-btn").hidden = false;
      document.getElementById("reject-call-btn").hidden = false;
      document.getElementById("callIn-info").innerHTML = "Cuộc gọi đến từ" + "\xa0" + session.phoneNumber;
      document.getElementById("debug-console").value += `Call incoming` + "\xa0" + session.phoneNumber + "\n";
      sessionCall = session;
      statusCall(session);

      let { accepted, rejectCause } = await session.accepted();
      if (!accepted) {
        return;
      }

      await session.terminated();
      document.getElementById("callIn-info").innerHTML = "";
      document.getElementById("hold-call-btn").hidden = true;
      document.getElementById("unhold-call-btn").hidden = true;
      document.getElementById("terminate-call-btn").hidden = true;
    } catch (e) {
      console.log(e);
    } finally {

    }
  });
}

function statusCall(session) {

  session.on("statusUpdate", function (status) {

    document.getElementById("debug-console").value += `Trạng thái của cuộc gọi đã thay đổi thành ${status.status}` + "\n";
  });

}

async function AcceptIncomingCall() {
  try {

    await sessionCall.accept();
    document.getElementById("accecpt-call-btn").hidden = true;
    document.getElementById("reject-call-btn").hidden = true;
    document.getElementById("hold-call-btn").hidden = false;
    document.getElementById("unhold-call-btn").hidden = false;
    document.getElementById("terminate-call-btn").hidden = false;
    document.getElementById("debug-console").value += `Call Accept ! \n`;
  }
  catch (e) {
    console.log(e);
  }
}

document.getElementById("accecpt-call-btn").addEventListener("click", AcceptIncomingCall);

async function RejectIncomingCall() {
  try {
    await sessionCall.reject();
    document.getElementById("accecpt-call-btn").hidden = true;
    document.getElementById("reject-call-btn").hidden = true;
    document.getElementById("callIn-info").innerHTML = "";
    document.getElementById("debug-console").value += `Call Reject ! \n`;
  }
  catch (e) {
    console.log(e);
  }
}

document.getElementById("reject-call-btn").addEventListener("click", RejectIncomingCall);

async function TerminateCall() {
  try {

    await sessionCall.terminate();
    document.getElementById("hold-call-btn").hidden = true;
    document.getElementById("unhold-call-btn").hidden = true;
    document.getElementById("terminate-call-btn").hidden = true;
    document.getElementById("call-btn").hidden = false;
    document.getElementById("callOut-info").innerHTML = "";
    document.getElementById("callIn-info").innerHTML = "";
    document.getElementById("debug-console").value += `Call Terminate ! \n`;
  }
  catch (e) {
    console.log(e);
  }
}

document.getElementById("terminate-call-btn").addEventListener("click", TerminateCall);

async function CancelOutGoingCall() {
  try {
    await sessionCall.cancel();
    document.getElementById("cancel-call-btn").hidden = true;
    document.getElementById("call-btn").hidden = false;
    document.getElementById("callOut-info").innerHTML = "";
    document.getElementById("debug-console").value += `Call Cancel ! \n`;
  }
  catch (e) {
    console.log(e);
  }
}
document.getElementById("cancel-call-btn").addEventListener("click", CancelOutGoingCall);

async function HoldCall() {
  try {
    await sessionCall.hold();
    document.getElementById("debug-console").value += `Call Hold ! \n`;
  }
  catch (e) {
    console.log(e);
  }
}

document.getElementById("hold-call-btn").addEventListener("click", HoldCall);

async function UnholdCall() {
  try {
    await sessionCall.unhold();
    document.getElementById("debug-console").value += `Call Unhold ! \n`;
  }
  catch (e) {
    console.log(e);
  }
}

document.getElementById("unhold-call-btn").addEventListener("click", UnholdCall);

document.getElementById("mic-mute").addEventListener("change", function () {
  if (this.checked) {
    sessionCall.media.input.muted = true;
    document.getElementById("debug-console").value += `Micro Muted ! \n`;
  } else {
    sessionCall.media.input.muted = false;
    document.getElementById("debug-console").value += `Micro Unmuted ! \n`;
  }
});

function sendDTMF() {
  var val = document.getElementById("dtmf-input").value;
  sessionCall.dtmf(val);

}

document.getElementById("send-dtmf-btn").addEventListener("click", sendDTMF);

function changeInputVolume(val) {

  sessionCall.media.input.volume = val;
  document.getElementById("debug-console").value += `Volume input change to ${val} \n`;
}

document.getElementById("volume-range-input").addEventListener("change", function () { changeInputVolume(document.getElementById("volume-range-input").value) });

function changeOutputVolume(val) {

  sessionCall.media.output.volume = val;
  document.getElementById("debug-console").value += `Volume output change to ${val} \n`;
}

document.getElementById("volume-range-output").addEventListener("change", function () { changeOutputVolume(document.getElementById("volume-range-output").value) });



function selectDeviceInput() {
  var selD = document.createElement("select");
  selD.name = "selectDeviceInput";
  selD.id = "selectDeviceInput";
  var options_strD = "";
  if (!navigator.mediaDevices?.enumerateDevices) {
    console.log("enumerateDevices() not supported.");
  } else {

    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        var devicesInput = devices.filter(device => device.kind == "audioinput");
        devicesInput.forEach((deviceI) => {

          options_strD += "<option value=" + deviceI.deviceId + "" > + deviceI.label + "</option>";
        });
        selD.innerHTML = options_strD;
        document.getElementById("selectDeviceInput").replaceWith(selD);
        document.getElementById("selectDeviceInput").addEventListener("change", function () { changeInputDevice(document.getElementById("selectDeviceInput").value, document.getElementById("selectDeviceInput").options[document.getElementById("selectDeviceInput").selectedIndex].text) });
      })
      .catch((err) => {
        console.error(`${err.name}: ${err.message}`);
      });
  }
}

function selectDeviceOutput() {
  var selDO = document.createElement("select");
  selDO.name = "selectDeviceOutput";
  selDO.id = "selectDeviceOutput";
  var options_strDO = "";
  if (!navigator.mediaDevices?.enumerateDevices) {
    console.log("enumerateDevices() not supported.");
  } else {

    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        var devicesOutput = devices.filter(device => device.kind == "audiooutput");
        devicesOutput.forEach((deviceO) => {

          options_strDO += "<option value=" + deviceO.deviceId + "" > + deviceO.label + "</option>";
        });
        selDO.innerHTML = options_strDO;
        document.getElementById("selectDeviceOutput").replaceWith(selDO);
        document.getElementById("selectDeviceOutput").addEventListener("change", function () { changeOutputDevice(document.getElementById("selectDeviceOutput").value, document.getElementById("selectDeviceOutput").options[document.getElementById("selectDeviceOutput").selectedIndex].text) });
      })
      .catch((err) => {
        console.error(`${err.name}: ${err.message}`);
      });
  }
}

function changeInputDevice(deviceId, deviceName) {
  document.getElementById("debug-console").value += `Thiết bị thu` + "\xa0" + deviceName + "\n";
  clientCall.defaultMedia.input.id = deviceId;
}



function changeOutputDevice(deviceId, deviceName) {
  document.getElementById("debug-console").value += `Thiết bị phát` + "\xa0" + deviceName + "\n";
  clientCall.defaultMedia.output.id = deviceId;
}

changeTypeCall("hotlineCall")
function changeTypeCall(type) {
  // if (type == "hotlineCall") {
  document.getElementById("labelSelectHotline").style.display = "block";
  document.getElementById("selectHotline").style.display = "block";
  document.getElementById("labelPhoneNumber").style.display = "block";
  document.getElementById("phoneNumber").style.display = "block";
  document.getElementById("labelMemberBranch").style.display = "none";
  document.getElementById("memberBranch").style.display = "none";
  // } else {
  //   document.getElementById("labelSelectHotline").style.display = "none";
  //   document.getElementById("selectHotline").style.display = "none";
  //   document.getElementById("labelPhoneNumber").style.display = "none";
  //   document.getElementById("phoneNumber").style.display = "none";
  //   document.getElementById("labelMemberBranch").style.display = "block";
  //   document.getElementById("memberBranch").style.display = "block";
  // }
}

document.getElementById("typeCall").addEventListener("change", function () { changeTypeCall(document.getElementById("typeCall").value) });

function waitAcceptSession(session) {
  session.on("progressUpdate", response => {
    if (response.message.statusCode === 183) {
      session.sessionSetDescription(response.message.body).catch(exception => {
        console.log(exception);

        session.terminate({
          statusCode: 488,
          reason_phrase: "Bad Media Description"
        });
      });
    }
  });
}
