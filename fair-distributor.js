/**
 * @author Kevin Nderitu <nderitukelvin19@gmail.com>
 * This is responsible for all the distribution processes
 * @param {Array} winners 
 * @param {Array} awards 
 * @param {Boolean} logger 
 */
function Distributor(winners, awards, logger = false){
    /** 
     * A copy of all winners
     */
    this.winners = [];
    //Enable/dissable UI logging
    this.logger = logger;
    //UI log dump
    this.dump = "";
    /**
     * Create winners
     */
    winners.forEach(function(winner) {
        var w = new Winner(winner);
        this.winners.push(w);
    }, this);
    /**
     * A copy of all awards
     */
    this.awards = [];

    /**
     * Populate awards
     */
    awards.forEach((award) => {
        var item = parseInt(award);
        if(!isNaN(item)){
            this.awards.push(item);
        }else{
            throw "Award values must be numbers separated by a comma";
        }
    })

    if(this.awards.length < this.winners.length){
        throw "<span style='color:red'>Error: Awards must be equal to or more than the winners.</span>";
    }
    /**
     * This initiates the pick process
     */
    this.compute = function(){
        //Allow each winner to have atleast one award
        this.orderRandomPick();

        do{
            this.shuffleWinners();
            this.reconcile();
        }while(!this.isFair());

    }

    /**
     * This is the first step, every winner is given 
     * a chance to pick a randow award till all awards 
     * are taken.
     */
    this.orderRandomPick = function(){
        var self = this;
        //choose randomly
        this.randomize();
        //make sure all winners get atleast an award
        this.winners.forEach(function(winner, index){
            if(winner.awards.length < 1){
                                                                                                                            self.log("<span style='color:red'>WARN: Winner " + (index + 1) + " did not choose anything.</span>");
                //If some winners did not get an award then order another pick
                self.orderRandomPick();
            }
        });
    }
    /**
     * Then the reconciliation process starts, every winner 
     * (A) demands to see every other winners (B) awards and if the 
     * difference of the awards value is more than the value 
     * of any award the winner B has, the winner A picks the 
     * award from winner B
     */
    this.reconcile = function(){
        var self = this;
        //Every winner gotta check...
        this.winners.forEach((winner) => {
                                                                                                                            self.log("Winner: " + winner);
            //against every other winner..
            this.winners.forEach((victim) => {
                //Except against themselves
                if(winner !== victim){
                    var valueDifference = victim.totalAwards() - winner.totalAwards();
                                                                                                                            self.log("   <i>" + victim + " has " + valueDifference + " more than " + winner + "</i>");
                    for(var i = 0; i < victim.awards.length; i++){
                        if(valueDifference >= victim.awards[i]){
                                                                                                                            self.log("   <i>Value difference of " + valueDifference + " is more than " + victim + "'s (" + victim.awards[i] + ")</i>");
                            
                            var item = victim.give(i);
                            winner.pick(item);
                            
                                                                                                                            self.log("   <i>" + winner + " picked " + item + " from " + victim +"</i>");
                        }
                    }
                }
            });
        });
    }

    /**
     * Check of the distribution is fair
     */
    this.isFair = function(){
        var self = this;
        //Sort all the winners in ASC order
        this.winners.sort(function(one, other) {
            return one.totalAwards() > other.totalAwards();
        });
        //Get the maximum value difference
        var difference = (this.winners[this.winners.length-1].totalAwards() - this.winners[0].totalAwards());

        if(difference == 0){
            return true;
        }
        var highWinnerAwards = this.winners[this.winners.length-1].awards;
                                                                                                                                    self.log("<br><span style='color: blue'><i>Checking process started</i></span><br>------------------------------------");
        for(var i = 0; i < highWinnerAwards.length; i++){
            console.log("Comparing between " + highWinnerAwards[i] + " and " + difference);
            if(highWinnerAwards[i] <= difference){
                                                                                                                                    self.log("<span style='color:red'><i>WARN: Unacceptable... begin another reconciliation.</i></span><br>------------------------------------");
                return false;
            }
        }
                                                                                                                                            ////For the love of logs
                                                                                                                                            self.log("<span style='color:green'><i>Checking process passed...</i></span>");
                                                                                                                                            ////////
        return true;
    }
    /**
     * This allows winners to pick a random award, 
     * assumes awards are equal to or more than winners
     */
    this.randomize = function(){
        var self = this;
        //Clear all awards picked
        this.winners.forEach(function(winner){ winner.awards = []; })
        this.awards.forEach((award) => {
            //Choose a random winner to award the current award
            var index = Math.floor((Math.random() * this.winners.length));
                                                                                                                                self.log("Chose winner: " + (index + 1));
            //Order the winner to pick this award
            this.winners[index].pick(award);
        });
    }

    /**
     * This shuffles all the winners
     */
    this.shuffleWinners = function() {
        var i = 0, j = 0, temp = null

        for (i = this.winners.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = this.winners[i];
            this.winners[i] = this.winners[j];
            this.winners[j] = temp;
        }
    }

    /**
     * Logger
     */
    this.log = function(log){
        if(this.logger){
            this.dump += log.replace(" "," ") + "<br>";
        }else{
            console.log(log);
        }
    }
}
//////////////////////////////////////////////////////
/**
 * This is an Object representing a winner
 * @param {String} name 
 */
//////////////////////////////////////////////////////
function Winner(name){
    /**
     * This is the name of this winner
     */
    this.name = name;
    /**
     * Awards given to this winner
     */
    this.awards = [];

    /**
     * Picks an award
     */
    this.pick = function(award){
        this.awards.push(award);
    }

    /**
     * Gives away an award
     */
    this.give = function(index){
        var item = this.awards[index];
        this.awards.splice(index, 1);
        return item;
    }
    /**
     * This returns the total value of all the awards this winner has
     */
    this.totalAwards = function(){
        //Do a reduce on this winner's award
        return this.awards.reduce(function(total, next){ return total + next;});
    }
    /**
     * For display purposes
     */
    this.toString = function(){
        return "<strong>" + this.name + "(" + this.totalAwards() + ")" + "</strong>";
    }
}