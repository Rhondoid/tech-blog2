const router = require('express').Router()
const { User, Post, Comment } = require('../../models');


router.get('/', (req, res) => {
  // Access our User model and run .findAll() method
  User.findAll({
      attributes: { exclude: ['password'] }
  })
    .then(userData => res.json(userData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});
//find user by id
router.get('/:id', (req, res) => {
  User.findOne({
      attributes: { exclude: ['password']},
      where: {
        id: req.params.id
      },
      include: [
          {
            model: Post,
            attributes: ['id', 'title', 'post_content', 'created_at']
          },
          {
              model: Comment,
              attributes: ['id', 'comment_text', 'created_at'],
              include: {
                model: Post,
                attributes: ['title']
              }
          }
        ]

  })
    .then(dbUserData => {
      if (!userData) {
        res.status(404).json({ message: 'No user found with this id' });
        return;
      }
      res.json(userData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});
 
router.post('/', async (req, res) => {
 
    try {
      const userData = await User.create(req.body);
      // console.log(userData)
      // res.json(userData)
      req.session.save(() => {
        req.session.user_id = userData.id;
        req.session.logged_in = true;
  
        res.status(200).json(userData);
      });
    } catch (err) {
      res.status(400).json(err);
    }
  });
  
  router.post('/login', async (req, res) => {
    // console.log("hello")
    try {

     
      const userData = await User.findOne({ where: { username: req.body.username } });
  //console.log(userData)
      if (!userData) {
        res
          .status(400)
          .json({ message: 'Incorrect username, please try again' });
        return;
      }

      // test check password with class repo
      const validPassword =  userData.checkPassword(req.body.password);
     /// console.log ({validPassword})
      if (!validPassword) {
        res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
        return;
      }
      
    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      req.session.username = userData.username;

      
      res.json({ user: userData, message: 'You are now logged in!' });
    });
   /////// res.send(userData)
    
  } catch (err) {
    res.status(400).json(err);
    }
  });
  
  router.post('/logout', (req, res) => {
    if (req.session.logged_in) {
      req.session.destroy(() => {
        res.status(204).end();
      });
    } else {
      res.status(404).end();
    }
  });



module.exports = router