import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType
} from 'discord.js';
import { db } from '../../db.js';

const cooldown = new Set();
const MAX_BET = 200000;

function drawCard() {
  const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];
  return cards[Math.floor(Math.random() * cards.length)];
}

function calculateTotal(hand) {
  let total = hand.reduce((a, b) => a + b, 0);
  let aces = hand.filter(c => c === 11).length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function renderHand(hand) {
  return hand.map(card => {
    if (card === 11) return 'A';
    if (card === 10) return ['10', 'J', 'Q', 'K'][Math.floor(Math.random() * 4)];
    return card.toString();
  }).join(', ');
}

export default {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Play enhanced blackjack with insurance and double down')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Bet amount (max 200,000)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    let amount = interaction.options.getInteger('amount');

    if (cooldown.has(userId)) {
      return interaction.reply({ content: '⏳ Wait 10 seconds before playing again.', ephemeral: true });
    }

    if (amount <= 0 || amount > MAX_BET) {
      return interaction.reply({ content: `❌ Bet must be between 1 and ${MAX_BET}.`, ephemeral: true });
    }

    let users = await db.get('users');
    let user = users.find(u => u.id === userId);

    if (!user || user.coins < amount) {
      return interaction.reply({ content: '💸 Not enough coins.', ephemeral: true });
    }

    user.totalBet = (user.totalBet || 0) + amount;
    if (user.initialCoins === undefined) user.initialCoins = user.coins;
    await db.set('users', users);

    const player = [drawCard(), drawCard()];
    const dealer = [drawCard(), drawCard()];
    let playerTotal = calculateTotal(player);
    const dealerShows = dealer[0];
    let gameOver = false;
    let doubled = false;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('hit').setLabel('Hit').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('stand').setLabel('Stand').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('double').setLabel('Double Down').setStyle(ButtonStyle.Success)
    );

    const embed = new EmbedBuilder()
      .setTitle('🎴 Blackjack')
      .setDescription(`Bet: **${amount}** coins`)
      .addFields(
        { name: 'Your Hand', value: `${renderHand(player)} (Total: ${playerTotal})`, inline: true },
        { name: 'Dealer Shows', value: `${renderHand([dealerShows])}`, inline: true }
      )
      .setColor(0x5865F2)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [row] });
    const reply = await interaction.fetchReply();

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
      filter: i => i.user.id === userId
    });

    collector.on('collect', async i => {
      if (gameOver) return;

      if (i.customId === 'double') {
        if (user.coins < amount * 2) {
          return i.reply({ content: '❌ Not enough coins to double down.', ephemeral: true });
        }
        user.coins -= amount; // spend the second half of the bet
        amount *= 2;
        doubled = true;
        player.push(drawCard());
        playerTotal = calculateTotal(player);
        await db.set('users', users);
      }

      if (i.customId === 'hit' || i.customId === 'double') {
        player.push(drawCard());
        playerTotal = calculateTotal(player);
        if (playerTotal > 21) {
          user.coins -= amount;
          gameOver = true;
          await db.set('users', users);
          const embedLose = EmbedBuilder.from(embed)
            .setFields(
              { name: 'Your Hand', value: `${renderHand(player)} (Total: ${playerTotal})`, inline: true },
              { name: 'Dealer Shows', value: `${renderHand([dealerShows])}`, inline: true }
            )
            .setDescription(`💥 You busted! Lost **${amount}** coins.`)
            .setColor(0xFF0000);
          return i.update({ embeds: [embedLose], components: [] });
        }
      }

      if (i.customId === 'stand' || i.customId === 'double') {
        let dealerTotal = calculateTotal(dealer);
        while (dealerTotal < 17) {
          dealer.push(drawCard());
          dealerTotal = calculateTotal(dealer);
        }

        let result = '';
        if (dealerTotal > 21 || playerTotal > dealerTotal) {
          user.coins += amount;
          result = `🎉 You win **${amount}** coins!`;
        } else if (dealerTotal === playerTotal) {
          result = `🤝 It's a tie!`;
        } else {
          user.coins -= amount;
          result = `💸 You lost **${amount}** coins.`;
        }

        await db.set('users', users);
        gameOver = true;

        const final = new EmbedBuilder()
          .setTitle('🎴 Blackjack Result')
          .addFields(
            { name: 'Your Hand', value: `${renderHand(player)} (Total: ${playerTotal})`, inline: true },
            { name: 'Dealer Hand', value: `${renderHand(dealer)} (Total: ${dealerTotal})`, inline: true }
          )
          .setDescription(result)
          .setColor(result.includes('win') ? 0x00FF00 : result.includes('tie') ? 0xFFFF00 : 0xFF0000)
          .setTimestamp();

        return i.update({ embeds: [final], components: [] });
      }

      const updated = EmbedBuilder.from(embed)
        .setFields(
          { name: 'Your Hand', value: `${renderHand(player)} (Total: ${playerTotal})`, inline: true },
          { name: 'Dealer Shows', value: `${renderHand([dealerShows])}`, inline: true }
        )
        .setDescription(doubled ? `🔁 You doubled down to **${amount}** coins.` : embed.data.description)
        .setTimestamp();

      return i.update({ embeds: [updated] });
    });

    collector.on('end', async (_, reason) => {
      if (!gameOver && reason === 'time') {
        await interaction.editReply({ content: '⌛ Game timed out.', components: [], embeds: [] });
      }
    });

    cooldown.add(userId);
    setTimeout(() => cooldown.delete(userId), 10000);
  }
};