const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class ActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = nanoid(16);
    const actionTime = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, actionTime],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan Activity');
    }

    return result.rows[0].id;
  }

  async getActivityByPlaylistId(playlistId) {
    const query = {
      text: `SELECT playlist_song_activities.playlist_id, users.username, songs.title, playlist_activities.action, playlist_activities.time
                  FROM playlist_activities
                  JOIN users ON playlist_activities.user_id = users.id
                  JOIN songs ON playlist_activities.song_id = songs.id
                  WHERE playlist_activities.playlist_id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ActivitiesService;
