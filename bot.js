// AGNT.Hub Daily Rewards Claim Bot
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const figlet = require('figlet');

// Constant variables
const API_BASE_URL = "https://hub-api.agnthub.ai/api";
const TOKEN_FILE = path.join(__dirname, 'token.txt');
const LOG_FILE = path.join(__dirname, 'claim_log.txt');

// ASCII Logo
const displayLogo = () => {
    console.log('\n');
    console.log(chalk.cyan(figlet.textSync('GETCAKE DIEYOUNG', {
        font: 'ANSI Shadow',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    })));
    console.log(chalk.magenta(figlet.textSync('Daily Claim Bot', {
        font: 'Small',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    })));
    console.log('\n');
    console.log(chalk.yellow('=================================================='));
    console.log(chalk.green('  AGNT.HUB ') + chalk.white('Daily Claimer'));
    console.log(chalk.green('  TG: https://t.me/getcakedieyoungx ') + chalk.white('github.com/getcakedieyoungx'));
    console.log(chalk.yellow('==================================================\n'));
}

// Colored log functions
const logTypes = {
    INFO: {color: chalk.blue, prefix: '📘 INFO'},
    SUCCESS: {color: chalk.green, prefix: '✅ SUCCESS'},
    WARNING: {color: chalk.yellow, prefix: '⚠️ WARNING'},
    ERROR: {color: chalk.red, prefix: '❌ ERROR'},
    CLAIM: {color: chalk.magenta, prefix: '🎁 CLAIM'},
    SYSTEM: {color: chalk.cyan, prefix: '🔧 SYSTEM'},
    NETWORK: {color: chalk.hex('#FFA500'), prefix: '🌐 NETWORK'}
};

// Log function
function logMessage(type, message) {
    const timestamp = new Date().toISOString();
    const logType = logTypes[type] || logTypes.INFO;
    const coloredMessage = logType.color(`[${timestamp}] ${logType.prefix}: ${message}`);
    const plainMessage = `[${timestamp}] ${logType.prefix}: ${message}\n`;
    
    console.log(coloredMessage);
    fs.appendFileSync(LOG_FILE, plainMessage);
}

// Visual separator
function displaySeparator() {
    console.log(chalk.yellow('--------------------------------------------------'));
}

// Read cookie information from token file
function readTokenFromFile() {
    try {
        if (fs.existsSync(TOKEN_FILE)) {
            return fs.readFileSync(TOKEN_FILE, 'utf8').trim();
        } else {
            logMessage('ERROR', "token.txt file not found!");
            return null;
        }
    } catch (error) {
        logMessage('ERROR', `Token reading error: ${error.message}`);
        return null;
    }
}

// Daily reward claim process
async function claimDailyReward() {
    try {
        displaySeparator();
        const cookieHeader = readTokenFromFile();
        
        if (!cookieHeader) {
            logMessage('ERROR', "Cannot proceed without cookie information.");
            return;
        }
        
        logMessage('SYSTEM', "Starting daily reward claim process...");
        
        // First, check the daily rewards status
        logMessage('NETWORK', "Checking daily rewards status...");
        const checkResponse = await axios.get(`${API_BASE_URL}/daily-rewards`, {
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json'
            }
        });
        
        const rewardStatus = checkResponse.data;
        logMessage('INFO', `Current reward status: Day ${chalk.bold(rewardStatus.day)}, Amount: ${chalk.bold(rewardStatus.rewardAmount)}, Claimable: ${rewardStatus.todaysRewardAvailable ? chalk.green('YES') : chalk.red('NO')}`);
        
        // If today's reward is available, claim it
        if (rewardStatus.todaysRewardAvailable) {
            logMessage('NETWORK', "Sending claim request...");
            const claimResponse = await axios.post(`${API_BASE_URL}/daily-rewards/claim`, {}, {
                headers: {
                    'Cookie': cookieHeader,
                    'Content-Type': 'application/json'
                }
            });
            
            const claimResult = claimResponse.data;
            logMessage('CLAIM', `${chalk.bold(claimResult.amount)} points successfully earned! 🎉`);
            
            // Update user information
            logMessage('NETWORK', "Updating user information...");
            const userResponse = await axios.get(`${API_BASE_URL}/users`, {
                headers: {
                    'Cookie': cookieHeader,
                    'Content-Type': 'application/json'
                }
            });
            
            const userData = userResponse.data;
            logMessage('SUCCESS', `Current total points: ${chalk.bold(userData.points)}`);
            
            // Calculate and show the next claim time
            const nextClaimTime = new Date();
            nextClaimTime.setHours(nextClaimTime.getHours() + 24);
            logMessage('INFO', `Next claim: ${chalk.bold(nextClaimTime.toLocaleString())} (in 24 hours)`);
            
            return {
                success: true,
                message: `Daily reward successfully claimed. ${claimResult.amount} points earned!`,
                totalPoints: userData.points,
                nextClaim: nextClaimTime
            };
        } else {
            logMessage('WARNING', "Reward for today already claimed or not yet available.");
            logMessage('INFO', `Next reward: Day ${chalk.bold(rewardStatus.nextDay)}, Amount: ${chalk.bold(rewardStatus.nextDayRewardAmount)}`);
            
            // Calculate and show the next claim time
            const nextClaimTime = new Date();
            nextClaimTime.setHours(nextClaimTime.getHours() + 24);
            logMessage('INFO', `Next claim attempt: ${chalk.bold(nextClaimTime.toLocaleString())} (in 24 hours)`);
            
            return {
                success: false,
                message: "Reward for today already claimed or not yet available.",
                nextDay: rewardStatus.nextDay,
                nextReward: rewardStatus.nextDayRewardAmount,
                nextClaim: nextClaimTime
            };
        }
    } catch (error) {
        logMessage('ERROR', `Error occurred during claim process: ${error.message}`);
        if (error.response) {
            logMessage('ERROR', `Error detail: ${JSON.stringify(error.response.data)}`);
        }
        
        // Even in case of error, show the next claim time
        const nextClaimTime = new Date();
        nextClaimTime.setHours(nextClaimTime.getHours() + 24);
        logMessage('INFO', `Next claim attempt: ${chalk.bold(nextClaimTime.toLocaleString())} (in 24 hours)`);
        
        return {
            success: false,
            message: "Error occurred: " + error.message,
            nextClaim: nextClaimTime
        };
    } finally {
        displaySeparator();
    }
}

// Function to run every 24 hours
async function startDailyClaimSchedule() {
    // First run
    await claimDailyReward();
    
    // Run every 24 hours (in milliseconds)
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    setInterval(async () => {
        logMessage('SYSTEM', "24 hours passed, starting new claim process...");
        await claimDailyReward();
    }, TWENTY_FOUR_HOURS);
    
    logMessage('SYSTEM', "Bot is set to run every 24 hours");
}

// Start the bot
displayLogo();
logMessage('SYSTEM', "AGNT.Hub Daily Rewards Claim Bot started!");
startDailyClaimSchedule().catch(error => {
    logMessage('ERROR', `Bot starting error: ${error.message}`);
});