const { fetchUsers, fetchUser, fetchEventsByUserId, addUser, removeUser, updateUserAttending} = require("../models/users.model");

exports.getUsers = (req, res, next) => {

    fetchUsers().then((users) => {
        res.status(200).send({users})
    }).catch(next)
    
};

exports.getUser = (req,res,next) => {

    const { user_id } = req.params

    fetchUser(user_id).then((user) => {
        res.status(200).send({user})
    })
    .catch(next)
}

exports.getEventsByUserId = (req,res,next) => {

    const { user_id } = req.params

    fetchUser(user_id).then(() => {

        return fetchEventsByUserId(user_id)

    })
    .then((events) => {
        res.status(200).send({events})
    })  
    .catch(next)
} 

exports.postUser = (req, res, next) => {

    addUser(req.body).then((newUser) => {
        res.status(200).send({newUser})
    })
    .catch(next)
}

exports.deleteUser = (req, res, next) => {

    const { user_id } = req.params

    removeUser(user_id).then(() => {
        res.status(204).send()
    })
    .catch(next)

}
