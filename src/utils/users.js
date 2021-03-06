const users = [];

//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
  //clean the data

  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data
  if (!username || !room) {
    return {
      error: "Username and Room are required!",
    };
  }

  //check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //validate username
  if (existingUser) {
    return {
      error: "username is in use!",
    };
  }
  // store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  //if user is found it will return 0 or above
  //if user is not found then it will return -1

  if (index !== -1) {
    return users.splice(index, 1)[0]; //it will remove the user with the index value
  }
};

const getUser=(id)=>{
    return users.find((user)=>user.id===id)
}

const getUsersInRoom=(room)=>{
    room= room.trim().toLowerCase()
    return users.filter((user)=>user.room===room)
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}