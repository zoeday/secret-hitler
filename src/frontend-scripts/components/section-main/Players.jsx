import React from 'react';
import $ from 'jquery';
import Policies from './Policies.jsx';

export default class Players extends React.Component {
	constructor() {
		super();
		this.clickedTakeSeat = this.clickedTakeSeat.bind(this);
		this.handlePlayerClick = this.handlePlayerClick.bind(this);
	}

	handlePlayerClick(e) {
		const {userInfo, gameInfo, socket} = this.props,
			{gameState} = gameInfo,
			{phase, clickActionInfo} = gameState,
			index = parseInt($(e.currentTarget).attr('data-index'), 10);

		if (phase === 'selectingChancellor' && userInfo.userName) {
			if (clickActionInfo[0] === userInfo.userName && clickActionInfo[1].includes(index)) {
				socket.emit('presidentSelectedChancellor', {
					chancellorIndex: index,
					uid: gameInfo.general.uid
				});
			}
		}

		if (phase === 'selectPartyMembershipInvestigate' && userInfo.userName) {
			if (clickActionInfo[0] === userInfo.userName && clickActionInfo[1].includes(index)) {
				socket.emit('selectPartyMembershipInvestigate', {
					playerIndex: index,
					uid: gameInfo.general.uid
				});
			}
		}

		if (phase === 'execution' && userInfo.userName) {
			if (clickActionInfo[0] === userInfo.userName && clickActionInfo[1].includes(index)) {
				socket.emit('selectedPlayerToExecute', {
					playerIndex: index,
					uid: gameInfo.general.uid
				});
			}
		}

		if (phase === 'specialElection' && userInfo.userName) {
			console.log(clickActionInfo);
			console.log(index);
			if (clickActionInfo[0] === userInfo.userName && clickActionInfo[1].includes(index)) {
				socket.emit('selectedSpecialElection', {
					playerIndex: index,
					uid: gameInfo.general.uid
				});
			}
		}
	}

	renderGovtToken(i) {
		const {publicPlayersState} = this.props.gameInfo;

		if (publicPlayersState && publicPlayersState[i].governmentStatus) {
			return <div	className={`government-token ${publicPlayersState[i].governmentStatus}`} />;
		}
	}

	renderLoader(i) {
		const {publicPlayersState} = this.props.gameInfo;

		if (publicPlayersState && publicPlayersState[i].isLoader) {
			return <div className="ui active tiny inverted loader" />;
		}
	}

	renderPlayers() {
		const {gameInfo, userInfo} = this.props,
			{playersState, gameState, publicPlayersState} = gameInfo;

		return publicPlayersState.map((player, i) => {
			return (
				<div key={i}
					data-index={i}
					onClick={this.handlePlayerClick}
					className={
						(() => {
							let classes = 'player-container';

							if (Object.keys(playersState).length && playersState[i].notificationStatus) {
								classes = `${classes} notifier ${playersState[i].notificationStatus}`;
							} else if (publicPlayersState && Object.keys(publicPlayersState).length && publicPlayersState[i].notificationStatus) {
								classes = `${classes} notifier ${publicPlayersState[i].notificationStatus}`;
							}

							if (publicPlayersState && Object.keys(publicPlayersState).length && publicPlayersState[i].isDead) {
								classes = `${classes} isDead`;
							}

							return classes;
						})()
					}>
					<div className={
						(() => {
							let classes = 'player-number';

							if (userInfo.userName && publicPlayersState.findIndex(player => player.userName === userInfo.userName) === i) {
								classes = `${classes} seated-user`;
							} else if (Object.keys(playersState).length && playersState[i].nameStatus) {
								classes = `${classes} ${playersState[i].nameStatus}`;
							} else if (Object.keys(publicPlayersState).length && publicPlayersState[i].nameStatus) {
								classes = `${classes} ${publicPlayersState[i].nameStatus}`;
							}

							if (!publicPlayersState[i].connected || publicPlayersState[i].leftGame) {
								classes = `${classes} disconnected`;
							}

							return classes;
						})()
					}>
						{(() => {
							if (gameState.isTracksFlipped) {
								return i + 1;
							}
						})()}
					</div>
					<div
						className={
						(() => {
							let classes = 'player-name';

							if (Object.keys(playersState).length && playersState[i].nameStatus) {
								classes = `${classes} ${playersState[i].nameStatus}`;
							} else if (Object.keys(publicPlayersState).length && publicPlayersState[i].nameStatus) {
								classes = `${classes} ${publicPlayersState[i].nameStatus}`;
							}

							if (!publicPlayersState[i].connected || publicPlayersState[i].leftGame) {
								classes = `${classes} disconnected`;
							}

							return classes;
						})()
					}
					>{player.userName}</div>
					{this.renderLoader(i)}
					{this.renderGovtToken(i)}
					<div
						className={
						(() => {
							let classes = 'card-container';

							if (Object.keys(playersState).length && playersState[i].cardStatus.cardDisplayed || (publicPlayersState && publicPlayersState[i].cardStatus.cardDisplayed)) {
								classes += ' showing';
							}

							if (Object.keys(playersState).length && playersState[i].cardStatus.isFlipped || (publicPlayersState && publicPlayersState[i].cardStatus.isFlipped)) {
								classes += ' flipped';
							}
							return classes;
						})()
					}>
						<div
							className={
							(() => {
								let classes = 'card card-front';

								if (Object.keys(publicPlayersState[i]).length && publicPlayersState[i].cardStatus.cardFront) {
									classes = `${classes} ${publicPlayersState[i].cardStatus.cardFront}`;
								}

								return classes;
							})()
						} />
						<div
							className={
							(() => {
								let classes = 'card card-back';

								if (playersState.length && Object.keys(playersState[i]).length && Object.keys(playersState[i].cardStatus).length && Object.keys(playersState[i].cardStatus.cardBack).length) {
									if (playersState[i].cardStatus.cardBack.icon || playersState[i].cardStatus.cardBack.icon === 0) {
										classes = `${classes} ${playersState[i].cardStatus.cardBack.cardName}${playersState[i].cardStatus.cardBack.icon.toString()}`;
									} else {
										classes = `${classes} ${playersState[i].cardStatus.cardBack.cardName}`;
									}
								} else if (publicPlayersState && Object.keys(publicPlayersState[i].cardStatus.cardBack).length) {
									if (publicPlayersState[i].cardStatus.cardBack.icon || publicPlayersState[i].cardStatus.cardBack.icon === 0) {
										classes = `${classes} ${publicPlayersState[i].cardStatus.cardBack.cardName}${publicPlayersState[i].cardStatus.cardBack.icon.toString()}`;
									} else {
										classes = `${classes} ${publicPlayersState[i].cardStatus.cardBack.cardName}`;
									}
								}

								return classes;
							})()
						} />
					</div>
				</div>
			);
		});
	}

	renderTakeSeat() {
		const {userInfo, gameInfo} = this.props;

		if (!userInfo.isSeated && !gameInfo.gameState.isTracksFlipped) {
			return <div className="ui left pointing label" onClick={this.clickedTakeSeat}>Take a seat</div>;
		}
	}

	clickedTakeSeat() {
		if (this.props.userInfo.userName) {
			this.props.onClickedTakeSeat();
		} else {
			$(this.signinModal).modal('show');
		}
	}

	render() {
		return (
			<section className="players">
				{this.renderPlayers()}
				{this.renderTakeSeat()}

				<div className="ui basic small modal signinnag" ref={c => {
					this.signinModal = c;
				}}>
					<div className="ui header">You will need to sign in or sign up for an account to play.</div>
				</div>
				<Policies
					gameInfo={this.props.gameInfo}
					userInfo={this.props.userInfo}
					socket={this.props.socket}
				/>
			</section>
		);
	}
}

Players.propTypes = {
	roles: React.PropTypes.array,
	userInfo: React.PropTypes.object,
	gameInfo: React.PropTypes.object,
	roleState: React.PropTypes.string,
	selectedGamerole: React.PropTypes.func
};