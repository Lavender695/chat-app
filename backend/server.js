const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 创建 WebSocket 服务器
const server = new WebSocket.Server({ port: 3000 });

// 存储连接的客户端
const clients = new Map();

// 消息存储文件路径
const MESSAGE_FILE = path.join(__dirname, 'messages.json');

// 加载历史消息
function loadMessages() {
    try {
        if (fs.existsSync(MESSAGE_FILE)) {
            const data = fs.readFileSync(MESSAGE_FILE, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('加载消息历史失败：', error);
        return [];
    }
}

// 保存消息到文件
function saveMessage(message) {
    try {
        const messages = loadMessages();
        messages.push(message);
        fs.writeFileSync(MESSAGE_FILE, JSON.stringify(messages, null, 2), 'utf8');
    } catch (error) {
        console.error('保存消息失败：', error);
    }
}

// 历史消息数组
let historyMessages = loadMessages();

server.on('connection', (socket) => {
    console.log('客户端已连接');
    let userId = null;

    // 接收客户端消息
    socket.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            // 处理用户登录
            if (data.type === 'login') {
                userId = data.userId;
                clients.set(userId, socket);
                console.log(`用户 ${userId} 已登录`);
                
                // 广播用户上线消息
                broadcast({
                    type: 'userList',
                    users: Array.from(clients.keys())
                });
                
                // 发送历史消息
                socket.send(JSON.stringify({
                    type: 'loginSuccess',
                    userId: userId,
                    historyMessages: historyMessages
                }));
                
                console.log(`发送了 ${historyMessages.length} 条历史消息给用户 ${userId}`);
            }
            // 处理删除消息请求
            else if (data.type === 'deleteMessage') {
                if (!userId) {
                    socket.send(JSON.stringify({ type: 'error', message: '请先登录' }));
                    return;
                }
                
                const messageId = data.messageId;
                if (deleteMessage(messageId)) {
                    // 广播消息删除事件给所有客户端
                    broadcast({
                        type: 'messageDeleted',
                        messageId: messageId
                    });
                    console.log(`用户 ${userId} 删除了消息 ${messageId}`);
                } else {
                    socket.send(JSON.stringify({ type: 'error', message: '删除消息失败' }));
                }
            }
            // 处理普通消息
            else if (data.type === 'message') {
                if (!userId) {
                    socket.send(JSON.stringify({
                        type: 'error',
                        message: '请先登录'
                    }));
                    return;
                }
                
                const messageData = {
                    type: 'message',
                    id: uuidv4(), // 添加唯一标识符
                    userId: userId,
                    content: data.content,
                    timestamp: new Date().toISOString()
                };
                
                console.log(`收到消息 from ${userId}: ${data.content}`);
                
                // 保存消息到历史记录
                saveMessage(messageData);
                historyMessages = loadMessages();
                
                // 广播消息给所有客户端
                broadcast(messageData);
            }
            // 处理设备信息请求
            else if (data.type === 'deviceInfo') {
                // 这里可以处理设备信息，实际应用中会转发给原生应用
                console.log(`设备信息请求 from ${userId}`);
            }
        } catch (error) {
            console.error('消息处理错误：', error);
        }
    });

    // 处理连接关闭
    socket.on('close', () => {
        if (userId) {
            clients.delete(userId);
            console.log(`用户 ${userId} 已断开连接`);
            
            // 广播用户下线消息
            broadcast({
                type: 'userList',
                users: Array.from(clients.keys())
            });
        } else {
            console.log('未登录客户端已断开连接');
        }
    });
});

// 实现删除消息的功能
function deleteMessage(messageId) {
    try {
        let messages = loadMessages();
        messages = messages.filter(msg => msg.id !== messageId);
        fs.writeFileSync(MESSAGE_FILE, JSON.stringify(messages, null, 2), 'utf8');
        historyMessages = messages;
        return true;
    } catch (error) {
        console.error('删除消息失败：', error);
        return false;
    }
}

// 广播消息给所有客户端
function broadcast(message) {
    const messageString = JSON.stringify(message);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageString);
        }
    });
}

console.log('WebSocket 服务器运行在 ws://localhost:3000');