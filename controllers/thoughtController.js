const { User, Thought } = require('../models');

module.exports = {
    getAllThoughts(req, res) {
        Thought.find({})
        .populate({
            path: "reactions",
            select: "-__v",
        })
        .select('-__v')
        .then((thoughts) => res.json(thoughts))
        .catch((err) => res.status(500).json(err))
    },
    getSinglethought(req, res){
        Thought.findOne({ _id: req.params.id })
        .populate({
            path: "reactions",
            select: "-__v",
        })
        .then((thoughts) => 
            !thoughts
            ? res.status(404).json({ message: 'No thought with that ID' })
            : res.json(thoughts)
        )
        .catch((err) => res.status(500).json(err))
    },
    createThought(req, res) {
        Thought.create(req.body)
        .then(({ _id }) => {
            return User.findOneAndUpdate(
                { _id: req.body.userId },
                { $push: { thoughts: _id } },
                { new: true }
            )
        })
        .then((thoughts) => 
            !thoughts
            ? res.status(404).json({ message: 'Thought created but there is no user with that ID' })
            : res.json({ message: 'Thought created successfully' })
        )
        .catch((err) => res.status(500).json(err))
    },
    updateThought(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.id },
            { $set: req.body },
            { runValidators: true, new: true }
        )
        .then((thoughts) => 
            !thoughts
            ? res.status(404).json({ message: 'No thought with that ID' })
            : res.json(thoughts)
        )
        .catch((err) => res.status(500).json(err))
    },
    deleteThought(req, res) {
        Thought.findOneAndDelete({ _id: req.params.id })
        .then((thoughts) => {
            !thoughts
            ? res.status(404).json({ message: 'No thought with this id!' })
            : User.findOneAndUpdate(
                { thoughts: req.params.id },
                { $pull: { thoughts: req.params.id } },
                { new: true },
            )
        })
        .then(() => res.json({ message: 'Thought deleted!' }))
        .catch((err) => {
            res.json(err)
        })
    },
    addReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $addToSet: { reactions: req.body } },
            { new: true, runValidators: true }
        )
        .then((thoughts) => {
            !thoughts
            ? res.status(404).json({ message: 'No thought with that ID' })
            : res.json(thoughts)
        })
        .catch((err) => res.status(500).json(err))
    },
    removeReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $pull: { reactions: req.body } },
            { new: true }
        )
        .then((thoughts) => {
            !thoughts
            ? res.status(404).json({ message: 'No thought with that ID' })
            : res.json(thoughts)
        })
        .catch((err) => res.status(500).json(err))
    }
}

