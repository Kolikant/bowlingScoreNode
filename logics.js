
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

hasNextRoll = function (frames, index) {
    if(index > 9) {
        return true
    } 
    if(index == 9) {
        return frames[index].rolls[2] != null
    }
    return frames[index + 1].rolls[0] != null
}

getNextRoll = function (frames, index) {
    if(index > 9) {
        return 0
    } 
    if(index == 9) {
        return frames[index].rolls[2]
    }
    return frames[index + 1].rolls[0]
}

hasNextTwoRolls = function (frames, index) {
    if(index > 9) {
        return true
    } 
    if(index == 9) {
        return frames[index].rolls[2] != null
    }
    if(module.exports.isStrike(frames[index + 1])) {
        return hasNextRoll(frames, index) && hasNextRoll(frames, index + 1)
    }
    return frames[index + 1].rolls[0] != null && frames[index + 1].rolls[1] != null
}

getNextTwoRolls = function (frames, index) {
    if(index > 9) {
        return 0
    } 
    if(index == 9) {
        return frames[index].rolls[2]
    }
    if(module.exports.isStrike(frames[index + 1])) {
        return getNextRoll(frames, index) + getNextRoll(frames, index + 1)
    }
    return frames[index + 1].rolls[0] + frames[index + 1].rolls[1]
}

getFrameScoreByIndex = function(frames, index) {
    if(frames[index].score && frames[index].score != null) {
        return frames[index].score
    } 
    if(module.exports.isSpare(frames[index])) {
        if(hasNextRoll(frames, index)) {
            console.log(getNextRoll(frames, index))
            return frames[index].rolls[0] + frames[index].rolls[1] + getNextRoll(frames, index)
        } else {
            return null
        }
    }
    if(module.exports.isStrike(frames[index])) {
        if(hasNextTwoRolls(frames, index)) {
            return frames[index].rolls[0] + frames[index].rolls[1] + getNextTwoRolls(frames, index)
        } else {
            return null
        }
    }
    if(frames[index].rolls[0] != null && frames[index].rolls[1] != null) {
        return frames[index].rolls[0] + frames[index].rolls[1]
    }

}

module.exports.calculateScore = function(frames) {
    let totalScore = 0;

    frames.map((frame, index) => {
        score = getFrameScoreByIndex(frames, index) 
        totalScore += score || 0
        return Object.assign(frame, { score })
    })
    return totalScore
}