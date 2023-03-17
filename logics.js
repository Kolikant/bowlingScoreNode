
module.exports.isStrike = function(frame) {
    return frame.rolls[0] == 10
}

module.exports.isSpare = function(frame) {
    return (frame.rolls[1] != null
        && frame.rolls[0] + frame.rolls[1] == 10)
}

module.exports.isStrikeOrSpare = function(frame) {
    return module.exports.isStrike(frame) || module.exports.isSpare(frame)
}

// getNextRoll(frames, index)

getFrameScore = function(frames, index) {
    score = null;
    if(!isStrike(frames[index]) && !isSpare(frames[index])) {
        score = frames[index].roll1 + frames[index].roll2
    }
    if(isSpare(frames[index])) {
        if(index == 9) {
            score = frames[index].roll1 + frames[index].roll2 + bonusRoll
        } else if (frames.length > index + 1) {
            score = frames[index].roll1 + frames[index]
                + frames[index + 1].roll1 + frames[index + 1]
        }
    }
    if(isStrike(frames[index])) {
        if(index == 9) {
            score = frames[index].roll1 + frames[index].roll2 + bonusRoll
        }
        // if()        
    }


    if(isStrike(frames[index]) || isSpare(frames[index])) {
        if(index == 9) {
            score += frames[index].bonusRoll
        } else if (frames.length > index + 1) {
            if(frames[index].roll1 == 10) {
                score += frames[index + 1].roll1 + frames[index + 1].roll2
            } else {
                score += frames[index + 1].roll1
            }
        } else {
            return null
        }
    }
    return score
}

module.exports.calculateScore = function(frames) {
    let totalScore = 0;

    frames.map((frame, index) => {
        score = getFrameScore(frames, index) 
        totalScore += score
        return Object.assign(frame, { score })
    })
    return totalScore
}

// strike = false;
// spare = false;
// score += frame.roll1 + frame.roll2
// if(frame.bonusRoll) {
//     score += frame.bonusRoll;
// }
// if(spare || strike) {
//     score += frame.roll1
// }
// if(strike) {
//     score += frame.roll2
// }
// spare = strike = false

// if(frame.roll1 == 10) {
//     strike = true;
// } else if(frame.roll1 + frame.roll2 == 10 ){
//     spare = true;
// }      
// console.log("_____________________")
// console.log(frame)
// console.log(score)