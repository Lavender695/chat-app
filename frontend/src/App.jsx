import { useState, useEffect, useRef } from 'react'
import './App.css'

// 存储工具函数
const storage = {
  // 保存数据
  setItem: (key, value) => {
    // 检查是否在Android环境中运行
    const isAndroid = /Android/i.test(navigator.userAgent)
    
    if (isAndroid && window.Android && window.Android.setStorageItem) {
      // 使用Android原生存储方法
      window.Android.setStorageItem(key, value)
    } else {
      // 使用Web Storage API
      localStorage.setItem(key, value)
    }
  },
  
  // 获取数据
  getItem: (key) => {
    // 检查是否在Android环境中运行
    const isAndroid = /Android/i.test(navigator.userAgent)
    
    if (isAndroid && window.Android && window.Android.getStorageItem) {
      // 使用Android原生存储方法
      return window.Android.getStorageItem(key)
    } else {
      // 使用Web Storage API
      return localStorage.getItem(key)
    }
  }
}

function App() {
  const [userId, setUserId] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, show: false, messageId: null })
  const wsRef = useRef(null)
  const messagesEndRef = useRef(null)

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 初始化WebSocket连接
  useEffect(() => {
    if (loggedIn && !wsRef.current) {
      // 检查是否在Android模拟器环境中运行
      const isAndroid = /Android/i.test(navigator.userAgent)
      // 根据运行环境选择WebSocket连接URL
      const wsUrl = isAndroid ? 'ws://10.0.2.2:3000' : 'ws://localhost:3000'
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket连接已建立')
        // 发送登录信息
        ws.send(JSON.stringify({
          type: 'login',
          userId: userId
        }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'message') {
            // 添加新消息
            setMessages(prev => {
              const newMessages = [...prev, data]
              // 保存消息到本地存储
              storage.setItem('chat_messages', JSON.stringify(newMessages))
              return newMessages
            })
          } else if (data.type === 'userList') {
            // 更新用户列表
            setUsers(data.users)
          } else if (data.type === 'loginSuccess') {
            console.log('登录成功')
            // 尝试从本地存储加载历史消息
            const savedMessages = storage.getItem('chat_messages')
            if (savedMessages) {
              try {
                setMessages(JSON.parse(savedMessages))
              } catch (error) {
                console.error('解析本地存储的消息失败：', error)
              }
            }
            // 如果服务器有历史消息，优先使用服务器消息
            if (data.historyMessages && data.historyMessages.length > 0) {
              setMessages(data.historyMessages)
              // 将服务器消息保存到本地存储
              storage.setItem('chat_messages', JSON.stringify(data.historyMessages))
            }
          } else if (data.type === 'messageDeleted') {
            // 删除消息
            setMessages(prev => {
              const newMessages = prev.filter(msg => msg.id !== data.messageId)
              // 更新本地存储
              storage.setItem('chat_messages', JSON.stringify(newMessages))
              return newMessages
            })
          } else if (data.type === 'error') {
            alert(data.message)
          }
        } catch (error) {
          console.error('消息解析错误：', error)
        }
      }

      ws.onclose = () => {
        console.log('WebSocket连接已关闭')
        wsRef.current = null
      }

      ws.onerror = (error) => {
        console.error('WebSocket错误：', error)
      }

      // 清理函数
      return () => {
        if (wsRef.current) {
          wsRef.current.close()
          wsRef.current = null
        }
      }
    }
  }, [loggedIn, userId])

  // 登录处理
  const handleLogin = (e) => {
    e.preventDefault()
    if (userId.trim()) {
      setLoggedIn(true)
    }
  }

  // 处理右键菜单显示
  const handleContextMenu = (e, messageId) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      show: true,
      messageId: messageId
    })
  }

  // 处理点击空白处关闭右键菜单
  const handleClickOutside = (e) => {
    if (contextMenu.show) {
      setContextMenu({ ...contextMenu, show: false })
    }
  }

  // 处理删除消息
  const handleDeleteMessage = (messageId) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert('WebSocket连接已关闭，请重新登录')
      return
    }
    
    // 发送删除消息请求
    wsRef.current.send(JSON.stringify({
      type: 'deleteMessage',
      messageId: messageId
    }))
    
    // 关闭右键菜单
    setContextMenu({ ...contextMenu, show: false })
  }

  // 发送消息
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content: message
      }))
      setMessage('')
    }
  }

  // 获取设备信息（调用原生方法）
  const getDeviceInfo = () => {
    if (window.Android && window.Android.getDeviceInfo) {
      window.Android.getDeviceInfo()
    } else {
      console.log('原生方法不可用，使用模拟设备信息')
      alert('设备信息：模拟设备 - Web模式')
    }
  }

  // 请求摄像头权限（调用原生方法）
  const requestCameraPermission = () => {
    if (window.Android && window.Android.requestCameraPermission) {
      window.Android.requestCameraPermission()
    } else {
      console.log('原生方法不可用，无法请求摄像头权限')
      alert('无法请求摄像头权限：Web模式下需手动授予')
    }
  }

  // 请求麦克风权限（调用原生方法）
  const requestMicrophonePermission = () => {
    if (window.Android && window.Android.requestMicrophonePermission) {
      window.Android.requestMicrophonePermission()
    } else {
      console.log('原生方法不可用，无法请求麦克风权限')
      alert('无法请求麦克风权限：Web模式下需手动授予')
    }
  }

  // 发送测试通知（调用原生方法）
  const sendTestNotification = () => {
    if (window.Android && window.Android.showNotification) {
      window.Android.showNotification('测试通知', '这是一条来自Web应用的测试通知')
    } else {
      console.log('原生方法不可用，无法发送通知')
      alert('无法发送通知：Web模式下不支持')
    }
  }

  // 退出登录
  const handleLogout = () => {
    // 关闭WebSocket连接
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    // 重置状态
    setLoggedIn(false)
    // 保留消息在本地存储中，不清除
    setUsers([])
    setMessage('')
    // 清除右键菜单
    setContextMenu({ ...contextMenu, show: false })
  }

  if (!loggedIn) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>聊天应用</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="请输入用户ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
            <button type="submit">登录</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-app">
      <div className="chat-header">
        <h1>聊天应用</h1>
        <div className="user-info">
          <span>当前用户：{userId}</span>
          <div className="native-buttons">
            <button onClick={getDeviceInfo} className="device-btn">设备信息</button>
            <button onClick={requestCameraPermission} className="device-btn">摄像头权限</button>
            <button onClick={requestMicrophonePermission} className="device-btn">麦克风权限</button>
            <button onClick={sendTestNotification} className="device-btn">发送通知</button>
            <button onClick={handleLogout} className="logout-btn">退出登录</button>
          </div>
        </div>
      </div>
      
      <div className="chat-container">
        <div className="users-sidebar">
          <h3>在线用户</h3>
          <ul>
            {users.map(user => (
              <li key={user} className={user === userId ? 'current-user' : ''}>
                {user}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="chat-messages" onClick={handleClickOutside}>
          {messages.map((msg, index) => (
            <div 
              key={msg.id || index} 
              className={`message ${msg.userId === userId ? 'sent' : 'received'}`}
              onContextMenu={(e) => handleContextMenu(e, msg.id)}
            >
              <div className="message-header">
                <span className="message-user">{msg.userId}</span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* 右键菜单 */}
      {contextMenu.show && (
        <div 
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div 
            className="context-menu-item"
            onClick={() => handleDeleteMessage(contextMenu.messageId)}
          >
            删除消息
          </div>
        </div>
      )}
      
      <div className="chat-input">
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="输入消息..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button type="submit">发送</button>
        </form>
      </div>
    </div>
  )
}

export default App
