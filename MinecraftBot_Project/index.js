
const mineflayer = require('mineflayer');

// Bot configuration
const bot = mineflayer.createBot({
  host: 'M6m7.aternos.me',
  port: 42439,
  username: 'WalkingBot',
  version: '1.21.5'
});

bot.on('login', () => {
  console.log('Bot logged in successfully!');
  console.log(`Bot spawned at: ${bot.entity.position}`);
});

function setupBotEvents() {
  bot.on('spawn', () => {
    console.log('Bot spawned in the world!');
    startWalking();
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    console.log(`<${username}> ${message}`);

    if (message === 'come') {
      const { GoalNear } = require('mineflayer-pathfinder').goals;
      const player = bot.players[username];
      if (player && player.entity) {
        bot.pathfinder.setGoal(new GoalNear(player.entity.position, 2));
      }
    } else if (message === 'stop') {
      bot.pathfinder.setGoal(null);
    } else if (message === 'follow') {
      const { GoalFollow } = require('mineflayer-pathfinder').goals;
      const player = bot.players[username];
      if (player && player.entity) {
        bot.pathfinder.setGoal(new GoalFollow(player.entity, 3), true);
      }
    } else if (message === 'jump') {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
      bot.chat('*jumps*');
    }
  });

  bot.on('chat', (username, message) => {
    if (message === 'help' && username !== bot.username) {
      bot.chat('Commands: come, stop, follow, jump, help');
    }
  });
}

setInterval(() => {
  if (bot && bot.entity) {
    console.log(`Bot is alive at: ${bot.entity.position}`);
  }
}, 300000);

bot.on('error', (err) => {
  console.log('Bot error:', err);
  setTimeout(() => {
    console.log('Attempting to reconnect...');
    process.exit(1);
  }, 5000);
});

bot.on('end', () => {
  console.log('Bot disconnected');
  setTimeout(() => {
    console.log('Attempting to reconnect...');
    process.exit(1);
  }, 5000);
});

bot.on('kicked', (reason) => {
  console.log('Bot was kicked:', reason);
  setTimeout(() => {
    console.log('Attempting to reconnect after kick...');
    process.exit(1);
  }, 10000);
});

function startWalking() {
  const mcData = require('minecraft-data')(bot.version);
  const pathfinder = require('mineflayer-pathfinder').pathfinder;
  const Movements = require('mineflayer-pathfinder').Movements;
  const { GoalNear, GoalXZ, GoalFollow } = require('mineflayer-pathfinder').goals;

  bot.loadPlugin(pathfinder);

  const defaultMove = new Movements(bot, mcData);
  bot.pathfinder.setMovements(defaultMove);

  console.log('Starting random walk and jump...');
  randomWalk();
  startJumping();
}

function randomWalk() {
  const { GoalXZ } = require('mineflayer-pathfinder').goals;

  setInterval(() => {
    if (!bot.pathfinder.isMoving()) {
      const pos = bot.entity.position;
      const x = pos.x + (Math.random() - 0.5) * 100;
      const z = pos.z + (Math.random() - 0.5) * 100;

      console.log(`Walking to: ${Math.round(x)}, ${Math.round(z)}`);
      bot.pathfinder.setGoal(new GoalXZ(x, z));
    }
  }, 10000);
}

function startJumping() {
  setInterval(() => {
    if (Math.random() < 0.3) {
      bot.setControlState('jump', true);
      console.log('Bot is jumping!');
      setTimeout(() => {
        bot.setControlState('jump', false);
      }, 500);
    }
  }, 2000);
}

setupBotEvents();
console.log('Starting Minecraft bot...');
