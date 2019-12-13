import { h, render, Component } from 'preact';
const socketClient = require('socket.io-client');


const ChatUserList = ({ users }) => {
    return <ul>
        {
            users.map((user) => 
                <li>
                    { user.id }
                </li>
            )
        }
    </ul>
}

class Chat extends Component<any, any> {
    chatSocket: any;

    messageSubmit: any;
    messageKeydown: any;

    constructor() {
        super();

        const roomNumber = Math.floor(Math.random()*5)

        this.state = {
            roomNumber,
            userList: [],
            msgs: [],
            someoneIsTyping: false,
            inProgressMsg: '', // form
        }

        this.chatSocket = socketClient(`/chat/${roomNumber}`, { transports: ['websocket'] });

        const addMessage = (message) => {
            this.setState({
                msgs: [ ...this.state.msgs, message ]
            });
        }

        const fetchUserList = () => {
            this.chatSocket.emit('user_list', ({ users: userList }) => {
                this.setState({
                    userList
                })
            });
        }

        this.chatSocket.on('user_joined_chat', ({ user }) => {
            addMessage(`Someone joined: ${user.id}`);
            fetchUserList();
        });

        this.chatSocket.on('user_left_chat', ({ user }) => {
            addMessage(`Someone left: ${user.id}`);
            fetchUserList();
        });

        this.chatSocket.on('message_from_user', ({ user, message }) => {
            addMessage(`${user.id}: ${message}`);
        });

        this.chatSocket.on('typing_from_user', ({ user }) => {
            if (this.state.someoneIsTyping) {
                clearTimeout(this.state.someoneIsTyping.timer)
            }

            this.setState({
                someoneIsTyping: {
                    user,
                    timer: setTimeout(() => {
                        this.setState({
                            someoneIsTyping: false
                        })
                    }, 500)
                }
            })
        })

        this.messageSubmit = (event) => {
            this.chatSocket.emit('message_from_user', this.state.inProgressMsg);
            addMessage(`You: ${this.state.inProgressMsg}`);
            
            this.setState({
                inProgressMsg: ''
            })

            event.preventDefault();
        }

        this.messageKeydown = (event) => {
            this.chatSocket.emit('typing_from_user', true);

            this.setState({
                inProgressMsg: event.target.value
            })
        }

        fetchUserList();
    }

    render({}, { roomNumber, userList, msgs, someoneIsTyping, inProgressMsg }) {
        return <div>
            Room#{ roomNumber }...
            <ul>
                {
                    msgs.map((msg) => 
                        <li>
                            { msg }
                        </li>
                    )
                }
            </ul>

            <ChatUserList users={ userList }/>

            <form onSubmit={ this.messageSubmit }>
                <input type="text" value={ inProgressMsg } onKeyDown={ this.messageKeydown }></input>
                <input type="submit" style="display: none" />
            </form>

            <div>
                { !!someoneIsTyping && <span>{ someoneIsTyping.user.id } is typing...</span> }
            </div>
        </div>
    }
}


render(<Chat />, document.body);