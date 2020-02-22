'use strict';
const PCancelable = require('p-cancelable');

const slowDown = PCancelable.fn(async ({config, convert, exportOptions, inputPath, outputPath}, onCancel) => {
	const {slowDownPercent, slowDownAudio} = config.store;

	const shouldSlowDownAudio = slowDownAudio && slowDownPercent <= 0.5 && !exportOptions.isMuted;

	const process = convert([
		'-i',
		inputPath,
		...(
			shouldSlowDownAudio ? [
				'-filter_complex',
				`[0:v]setpts=${1 / slowDownPercent}*PTS[v];[0:a]atempo=${slowDownPercent}[a]`,
				'-map',
				'[v]',
				'-map',
				'[a]'
			] : [
				'-filter:v', `setpts=${1 / slowDownPercent}*PTS`
			]
		),
		outputPath
	], 'Slowing down');

	onCancel(() => {
		process.cancel();
	});

	return process;
});

const slowDownService = {
	title: 'Slow down',
	config: {
		slowDownPercent: {
			title: 'Slow down percent',
			description: 'Percent by which to slow down the video by. For example, 0.5 means half speed, and double the duration.',
			type: 'number',
			minimum: 0,
			maximum: 1,
			default: 0.5,
			required: true
		},
		slowDownAudio: {
			title: 'Slow down audio',
			description: 'This only works if slow percent is less or equal to 0.5',
			type: 'boolean',
			default: true
		}
	},
	action: slowDown
};

const speedUp = PCancelable.fn(async ({config, convert, exportOptions, inputPath, outputPath}, onCancel) => {
	const {speedUpPercent, speedUpAudio} = config.store;

	const shouldspeedUpAudio = speedUpAudio && speedUpPercent <= 2 && !exportOptions.isMuted;

	const process = convert([
		'-i',
		inputPath,
		...(
			shouldspeedUpAudio ? [
				'-filter_complex',
				`[0:v]setpts=${1 / speedUpPercent}*PTS[v];[0:a]atempo=${speedUpPercent}[a]`,
				'-map',
				'[v]',
				'-map',
				'[a]'
			] : [
				'-filter:v', `setpts=${1 / speedUpPercent}*PTS`
			]
		),
		outputPath
	], 'Speeding up');

	onCancel(() => {
		process.cancel();
	});

	return process;
});

const speedUpService = {
	title: 'Speed up',
	config: {
		speedUpPercent: {
			title: 'Speed up mutliplier',
			description: 'Multiplier by which to speed up the video by. For example, 2 means double the speed, and half the duration.',
			type: 'number',
			minimum: 1,
			default: 2,
			required: true
		},
		speedUpAudio: {
			title: 'Speed up audio',
			description: 'This only works if speed up multiplier is less or equal to 2',
			type: 'boolean',
			default: true
		}
	},
	action: speedUp
};

exports.editServices = [slowDownService, speedUpService];
