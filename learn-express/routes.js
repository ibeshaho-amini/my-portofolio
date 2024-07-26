const express = require("express")
    const Post = require("./Models/Blogs") 
    const User = require("./Models/User")
    const Comments = require("./Models/Coments")
    const router = express.Router()
    const fs = require('fs').promises;const cloudinary = require("./cloudinary");
    const upload = require("./multer");
    // Get all posts
    router.get("/blog", async (req, res) => {
        const posts = await Post.find()
        res.send(posts)
    })

    router.post("/users", async (req, res) => {
        const post = new User({
            username: req.body.username,
            password: req.body.password,
        })
        await post.save()
        res.send(post)
    })

    // router.post('/posts/:blog_id/:user_id/comments', async (req, res) => {
    //     const commentLike = new Comments({
    //         like: req.body.like || 0,
    //         blog_id: req.params.blog_id,
    //         user_id: req.body.user_id,
    //         comment: req.body.comment,
    //     })
    //     await commentLike.save()
    //     res.send(commentLike)
    // })


    router.post('/posts/:blog_id/:user_id/comments', async (req, res) => {
        try {
            const post = await Post.findById(req.params.blog_id);
            const user = await User.findById(req.params.user_id);
    
            if (!post) {
                return res.status(404).send({ error: "Post not found" });
            }
    
            if (!user) {
                return res.status(404).send({ error: "User not found" });
            }
    
            const commentLike = new Comments({
                like: req.body.like || 0,
                blog_id: req.params.blog_id,
                user_id: req.params.user_id,
                comment: req.body.comment,
            });
    
            await commentLike.save();
            res.send(commentLike);
        } catch (error) {
            res.send({ error: "Error adding comment/like" });
        }
    });


    router.post("/posts", async (req, res) => {
        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author,
        })
        await post.save()
        res.send(post)
    })

    router.get("/posts/:id", async (req, res) => {
        try {
            const post = await Post.findOne({ _id: req.params.id })
            res.send(post)
        } catch {
            res.status(404)
            res.send({ error: "Post doesn't exist!" })
        }
    })

    router.patch("/posts/:id", async (req, res) => {
        try {
            const post = await Post.findOne({ _id: req.params.id })
    
            if (req.body.title) {
                post.title = req.body.title
            }
    
            if (req.body.content) {
                post.content = req.body.content
            }
    
            await post.save()
            res.send(post)
        } catch {
            res.status(404)
            res.send({ error: "Post doesn't exist!" })
        }
    })

    router.delete("/posts/:id", async (req, res) => {
        try {
            await Post.deleteOne({ _id: req.params.id })
            res.status(204).send()
        } catch {
            res.status(404)
            res.send({ error: "Post doesn't exist!" })
        }
    })
    

    router.post('/blog/:id/image', upload, async (req, res) => {
        if (req.file === undefined) {
          return res.status(400).json({ err: 'Please select an image' });
        }
      
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "Posts"
          });
      
          const post = await Post.findById(req.params.id);
          
          if (!post) {
            return res.status(404).json({ message: 'Post not found' });
          }
      
          post.image = result.secure_url;
          post.public_id = result.public_id;
          await post.save();
      
          await fs.unlink(req.file.path);
      
          return res.status(200).json({
            message: 'Image uploaded successfully',
            id: post._id,
            image: post.image
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Server error' });
        }
      });

    module.exports = router