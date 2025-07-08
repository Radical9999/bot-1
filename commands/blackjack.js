import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { db } from '../economy.js';

function drawCard() {
  const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // 11 = Ace
  return cards[Math.floor(Math.random() * cards.length)];
}

function calculateTotal(hand) {
  let total = hand.reduce((a, b) => a + b, 0);
  let aces = hand.filter(card => card === 11).length;
  while (total > 21 && aces--) total -= 10;
  return total;
}

export default {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Play blackjack against the dealer')
    .addIntegerOption(opt => opt.setName('amount').setDescription('Bet amount').setRequired(true)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const userId = interaction.user.id;
    const user = db.data.users[userId] || { coins: 0 };
    if (amount <= 0 || user.coins < amount)
      return await interaction.reply({ content: '❌ Invalid or insufficient funds.', ephemeral: true });

    const player = [drawCard(), drawCard()];
    const dealer = [drawCard(), drawCard()];

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('hit').setLabel('🃏 Hit').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('stand').setLabel('🛑 Stand').setStyle(ButtonStyle.Secondary)
    );

    const message = await interaction.reply({
      content: `🧑 Your hand: ${player.join(', ')} = ${calculateTotal(player)}
🃙 Dealer shows: ${dealer[0]}`,
      components: [row],
      fetchReply: true
    });

    const filter = i => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'hit') {
        player.push(drawCard());
        const total = calculateTotal(player);
        if (total > 21) {
          user.coins -= amount;
          await i.update({ content: `💥 You busted with ${total}. Dealer wins!
New balance: ${user.coins}`, components: [] });
          db.data.users[userId] = user;
          await db.write();
          collector.stop();
        } else {
          await i.update({ content: `🧑 Your hand: ${player.join(', ')} = ${total}
🃙 Dealer shows: ${dealer[0]}`, components: [row] });
        }
      } else if (i.customId === 'stand') {
        let dealerTotal = calculateTotal(dealer);
        while (dealerTotal < 17) {
          dealer.push(drawCard());
          dealerTotal = calculateTotal(dealer);
        }

        const playerTotal = calculateTotal(player);
        let result;
        if (dealerTotal > 21 || playerTotal > dealerTotal) {
          result = '🎉 You win!';
          user.coins += amount;
        } else if (dealerTotal === playerTotal) {
          result = '🤝 Draw!';
        } else {
          result = '😢 Dealer wins!';
          user.coins -= amount;
        }

        await i.update({
          content: `${result}
🧑 Your hand: ${player.join(', ')} = ${playerTotal}
🃙 Dealer hand: ${dealer.join(', ')} = ${dealerTotal}
New balance: ${user.coins}`,
          components: []
        });
        db.data.users[userId] = user;
        await db.write();
        collector.stop();
      }
    });
  }
};