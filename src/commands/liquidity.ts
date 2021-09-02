import { SlashCommand } from 'slash-create';
import fetch from 'node-fetch';
import { formatLargeNumber } from '../utils';
const Discord = require('discord.js');

module.exports = class HelloCommand extends SlashCommand {
  

  constructor(creator) {
    super(creator, {
      name: 'liquidity',
      description: 'Get todays liquidity in the USDC/MM Pool (As LP Millionaire)',
      guildIDs: [process.env.GUILD_ID],
      options: [
        {
          name: 'usdc',
          description: 'MM / USDC 1% Pool',
          required: false,
          type: 1,

        },
        {
          name: 'eth',
          description: 'MM / ETH 0.3% Pool',
          required: false,
          type: 1,

        }
      ],
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }
  
  
  async run(ctx) {

    var currentSubCommandName = '';
    var currentSubCommandDesc = '';//todo define this in a static string later.
    var token1Name = '';
    var poolId = '0x84383fb05f610222430f69727aa638f8fdbf5cc1';//USDC MM 1% Pool as default
    

    //console.log(ctx);

    if (ctx != undefined){
      if (ctx.subcommands != undefined && ctx.subcommands.length == 1){
        currentSubCommandName = ctx.subcommands[0];

        if (currentSubCommandName == 'usdc') {
          
          poolId = '0x84383fb05f610222430f69727aa638f8fdbf5cc1';
          currentSubCommandDesc = 'MM / USDC 1% Pool';
          token1Name = 'USDC';

        } else if (currentSubCommandName == 'eth') {
          poolId = '0x9ac681f68a589cc3763bad9ce43be3380696b136';
          currentSubCommandDesc = 'MM / ETH 0.3% Pool';
          token1Name = 'ETH';

        }
      }



    }


      const apiUrl = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'
      const query = `
      {
        pool(
          id:"${poolId}")
        {
          id
          volumeUSD
          liquidity
          totalValueLockedToken0
          totalValueLockedToken1
          
          poolDayData(orderBy:date, orderDirection:desc,first : 1){
            date
            volumeUSD
            token0Price
            token1Price
          }
        }
      }
      `
      const init = {
        method: 'POST',
        body: JSON.stringify({ query }),
      };

      const getData = async () => {
        const { body } = await fetch(apiUrl, init)
        body.on('data', data => {
          const json = JSON.parse(data)
          //console.log(json)
          let volumeUSD_value = json.data.pool.poolDayData[0].volumeUSD;
          let priceMM = parseFloat(json.data.pool.poolDayData[0].token0Price);
          let priceUSDC = parseFloat(json.data.pool.poolDayData[0].token1Price);//could be eth in case of other pool
          let tvl_MM = json.data.pool.totalValueLockedToken0;
          let tvl_USDC = json.data.pool.totalValueLockedToken1;//could be eth in case of other pool



          const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#18FFFF')
            .setThumbnail('https://imgur.com/NCcqu3m.png')
            .setTitle(`${currentSubCommandDesc}`)
            .setURL(`https://info.uniswap.org/#/pools/${poolId}`)
            /*
            .addFields(
                { name: `Today's Volume:`, value: `${formatLargeNumber(volumeUSD_value)}`, Inline: true },
                //{ name: '\u200B', value: '\u200B', Inline: false },
                { name: `1 MM:`, value: `${priceUSDC.toFixed(2)} ${token1Name}`, Inline: true },
                { name: `1 ${token1Name}:`, value: `${priceMM.toFixed(4)} MM`, Inline: true },
            )
            //.addField(`Today's Volume:`, `${formatLargeNumber(volumeUSD_value)}`, false)
            //.addField(`1 MM =`, `${formatLargeNumber(priceUSDC)} ${token1Name}`, false)
            //.addField(`1 ${token1Name} =`, `${formatLargeNumber(priceMM)} MM`, false)
            //.addField('\u200B','\u200B', false)
            //.addField('Tokens Locked:', `\u200B`, false)
            .addField('MM', `${formatLargeNumber(tvl_MM)}`, true)
            .addField(`${token1Name}`, `${formatLargeNumber(tvl_USDC)}`, true)
            .addField('Locked!', `\u200B`, true)
            */
           .addFields(
            { name: `Today's Volume:`, value: `${formatLargeNumber(volumeUSD_value)}`, Inline: true },
            //{ name: '\u200B', value: '\u200B', Inline: false },
            { name: `MM Price:`, value: `${priceUSDC.toFixed(2)} ${token1Name}`, Inline: false },
            { name: `${token1Name} Price:`, value: `${priceMM.toFixed(4)} MM`, Inline: false },
        )
        //.addField(`Today's Volume:`, `${formatLargeNumber(volumeUSD_value)}`, false)
        //.addField(`1 MM =`, `${formatLargeNumber(priceUSDC)} ${token1Name}`, false)
        //.addField(`1 ${token1Name} =`, `${formatLargeNumber(priceMM)} MM`, false)
        //.addField('\u200B','\u200B', false)
        //.addField('Tokens Locked:', `\u200B`, false)
        .addField('Locked\nMM', `${formatLargeNumber(tvl_MM)}`, true)
        .addField(`Tokens\n${token1Name}`, `${formatLargeNumber(tvl_USDC)}`, true)
        //.addField('Locked!', `\u200B`, true)


          //console.log(exampleEmbed)
          ctx.send({ embeds: [exampleEmbed] });
        })
      }

      getData()
    
    
  }
};
