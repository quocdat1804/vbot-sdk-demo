# VBot Web SDK

# v 2.0.0

> Cập nhật

- Giản lược api
- Giảm kích thước SDK

## Kết nối

- Khởi tạo một VBotClient:

  - access_token: Token của user
  - delegate_methods: Nhận các sự kiện của client

  ```jsx
  const delegate_methods = {
    //Called when user is connected to server.
    onServerConnect: () => {},
    // Called when user is no longer connected.
    onServerDisconnect: () => {},
    // Called when user is registered to received calls.
    onRegistered: () => {},
    // Called upon receiving a message.
    onMessageReceived: (msg) => {},
    // Called when a call is received.
    onCallReceived: (session) => {},
    // Called when a call is hung up.
    onCallHangup: (session) => {},
    // Called when a call is created.
    onCallCreated: (session) => {},
    // Called when a call is answered.
    onCallAnswered: (session) => {},
    // Called when user is click call on dialpad.
    onCallFromDialPad: (phoneNumber, hotlineNumber) => {},
  };

  var client = await VBotClient(access_token, delegate_methods);
  ```

- Kết nối với máy chủ VBot:
  ```jsx
  client.connect();
  ```

## Bàn phím số

```jsx
// Ẩn hiện bàn phím
// show: bool
client.showDialpad(show);
```

## Lấy danh sách hotline

```jsx
const hotlines = await client.getHotlines();
```

## Thực hiện cuộc gọi

```jsx
client.call("0947782871", "10636553528291880559");
```

## Các hành động trong cuộc gọi

- Lấy số điện thoại của cuộc gọi
  ```jsx
  client.getRemoteIdentity().phoneNumber;
  ```
- Chấp nhận 1 cuộc gọi đến:
  ```jsx
  client.accept();
  ```
- Từ chối 1 cuộc gọi đến:
  ```jsx
  client.reject();
  ```
- Gác máy:
  ```jsx
  client.hangup();
  ```
- Giữ/Hủy giữ cuộc gọi:
  ```jsx
  client.hold();
  client.unhold();
  ```
- Tắt/Bật mic:
  ```jsx
  client.mute();
  client.unmute();
  ```
- Gửi DTMF:
  ```jsx
  client.sendDtmf(dataset.key);
  ```
- I/O devices:
  ```jsx
  client.changeAudioInput("device input id");
  client.changeAudioInput("device output id");
  ```
