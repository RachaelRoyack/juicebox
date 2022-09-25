const { client, getAllUsers, createUser, updateUser, getAllPosts, createPost, updatePost, getUserById, addTagsToPost, createTags, getPostsByTagName} = require('./index');

  async function dropTables() {
    try {
      console.log("Starting to drop tables...")

      await client.query(`
      DROP TABLE IF EXISTS post_tags;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS posts; 
      DROP TABLE IF EXISTS users;
      `);



      console.log("Finished dropping tables!");

    } catch (error) {
        console.log('error dropping tables');
      throw error; // we pass the error up to the function that calls dropTables
    }
  }

  async function createTables() {
    try {

        console.log("Starting to build tables...");

      await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true
      );
      `);

      await client.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id) NOT NULL,
        title varchar(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
      `);

      await client.query(`
      CREATE TABLE tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
        );
      `);

      await client.query(`
      CREATE TABLE post_tags (
        "postId" INTEGER REFERENCES posts(id),
        "tagId" INTEGER REFERENCES tags(id),
        UNIQUE ("postId", "tagId")
        );
      `);

        console.log('Finished building tables!')
    } catch (error) {
        console.log('Error building tables!')
      throw error; // we pass the error up to the function that calls createTables
    }
  }

  async function createInitialUsers() {
    try {
      console.log("Starting to create users...");
  
      const albert = await createUser({ username: 'albert', password: 'bertie99', name: 'Al Bert', location: 'Sidney, Australia' });
      const sandra = await createUser({ username: 'sandra', password: '2sandy4me', name: 'Just Sandra', location: "Ain't tellin" });
      const glamgal = await createUser({ username: 'glamgal', password: 'soglam', name: 'Joshua', location: 'Upper East Side'});
  
      console.log(albert);
      console.log(sandra);
      console.log(glamgal);
  
      console.log("Finished creating users!");
    } catch(error) {
      console.error("Error creating users!");
      throw error;
    }
  }

  async function createInitialPosts() {
    try {
      const [albert, sandra, glamgal] = await getAllUsers();

      await createPost ({
        authorId: albert.id,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
        tags: ["#happy", "#youcandoanything"]
      });

      await createPost ({
        authorId: albert.id,
        title: "Second Post",
        content: "This is my Second post. Just testing things out.",
        tags: ["#happy"]
      });

      await createPost ({
        authorId: sandra.id,
        title: "Sandy's First Post",
        content: "Hey everyone, writing posts instead of going to the beach.",
        tags: ["#sad", "#worst-day-ever"]
      });

      await createPost ({
        authorId: sandra.id,
        title: "Sandy's Second Post",
        content: "Weather is still bad so here I am posting again.",
        tags: ["#happy", "#youcandoanything", "#catmandoeverything"]
      });

      await createPost ({
        authorId: glamgal.id,
        title: "GlamGal's First Post",
        content: "Come see me for makeup tips!",
        tags: ["#catmandoeverything", "#youcandoanything"]
      });



      console.log('Finished creating Posts')

    } catch (error) {
      throw error;
    }
  }


  async function rebuildDB() {
    try {
      client.connect();
  
      await dropTables();
      await createTables();
      await createInitialUsers();
      await createInitialPosts();

    } catch (error) {
      console.log('Error during rebuild');
      throw error;
    } 
  }

 

 
  async function testDB() {

    
    try {
        console.log("Starting to test database...");

        console.log("Calling getAllUsers")
      const users = await getAllUsers()
        console.log("Result: ", users);

        console.log("Calling updateUser on users[0]")
        const updateUserResult = await updateUser(users[0].id, {
          name: "Newname Sogood",
          location: 'Lesterville, KY'
        });
        console.log('Result: ', updateUserResult);


        console.log("Calling getAllPosts");
        const posts= await getAllPosts();
        console.log ('Result: ', posts);

        console.log('Calling updatePost on posts[0]');
        const updatePostResult = await updatePost(posts[0].id, {
          title: 'New Title',
          content: "Updated Content"
        });
        console.log('Result: ', updatePostResult);

        console.log('Calling getUserById with 1');
        const albert = await getUserById(1);
        console.log('Result: ', albert);

        console.log("Calling updatePost on posts[1], only updating tags");
        const updatePostTagResult = await updatePost(posts[1].id, {tags: ['#youcandoanything', "#redfish", '#bluefish'
        ]})
        console.log('Results: ', updatePostTagResult)

        console.log("Calling getPostsByTagName with #happy");
        const postsWithHappy = await getPostsByTagName("#happy");
        console.log("Result:", postsWithHappy);

       
        

        console.log("Finished database tests!");
    } catch (error) {
      console.error("Error testing database!");
      throw error;
    }
  }

  rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());