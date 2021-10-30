import {Response} from 'node-fetch';
import {MessageEmbedOptions, CommandContext} from 'slash-create';
import {ContractAddresses, CovalentChainIds} from './types';

export function formatLargeNumber(number: number): string {
  const num = Math.abs(Number(number));
  return num >= 1.0e+9
    ? (num / 1.0e+9).toFixed(2) + "B"
    : num >= 1.0e+6
      ? (num / 1.0e+6).toFixed(2) + "M"
      : num >= 1.0e+3
        ? (num / 1.0e+3).toFixed(2) + "K"
        : num.toFixed(2);
}

export function formatPercentageChange(number: number): string {
  return `${(number > 0 ? '+' : '')}${(number * 100).toFixed(2)}`;
}

export function hasJsonContentType(resp: Response): boolean {
  if (!(resp instanceof Response)) {
    return false;
  }

  const contentType = resp.headers.get('Content-Type');
  const hasJSON = contentType.includes('application/json');
  
  return hasJSON;
}

/**
 * Creates a Discord embedded message to be used for sending a status of a command.
 * @param title Title of the status (ie "Update Message Success" or "Access Denied").
 * @param message Detailed description of the status.
 * @param error boolean - If this is an error status, use `true`. Defaults to `false`.
 * @returns 
 */
export function createStatusEmbed(
  title: string, 
  message: string, 
  error = false
): MessageEmbedOptions {
  const color = error ? 16711680 : 65280;
  const mainTitle = error ? 'Error' : 'Success';

  return {
    color: color,
    title: mainTitle, 
    fields: [
      {
        name: title, 
        value: message
      }
    ]
  }
}

/**
 * Checks if the user has the correct roles to use the slash command.
 * @param ctx CommandContext
 * @param allowedRoles Array of user role IDs
 * @returns True if use has a valid role, else false
 */
export function hasAllowedRoles(
  ctx: CommandContext, 
  allowedRoles: string[]
): boolean {
  let isAllowed = false;
  const memberRoles = ctx.member.roles;

  for (const memberRole of memberRoles) {
    if (allowedRoles.includes(memberRole)) {
      isAllowed = true;
      break;
    }
  }

  return isAllowed;
}

/**
   * Creates the correct CovalentHQ URL string for each exchange 
   * @param chainId
   * @param address 
   * @returns 
   */
export function createCovalentUrl(chainId: CovalentChainIds, address: ContractAddresses): string {
  return `https://api.covalenthq.com/v1/${chainId}/tokens/${address}/token_holders/?key=${process.env.COVALENT_API_KEY}&page-size=1`;
}