const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistMscService {
  constructor(activitiesService, usersService, collaborationsService) {
    this._pool = new Pool();
    this._activitiesService = activitiesService;
    this._usersService = usersService;
    this._collaborationsService = collaborationsService;
  }

  async addSongPlaylist({ playlistId, songId, userId }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
    await this._activitiesService.addActivity(playlistId, songId, userId, 'add');
  }

  async getSongsPlaylist(playlistId) {
    const query = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs INNER JOIN playlist ON songs.id = playlist_msc.song_id WHERE playlist_msc.playlist_id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteSongPlaylist(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Proses penghapusan lagu dalam playlist gagal');
    }

    await this._activitiesService.addActivity(playlistId, songId, userId, 'delete');
  }

  async getActivityPlaylistId(playlistId, userId) {
    await this._usersService.verifyUserId(userId);

    const data = { playlistId, activities: [] };
    const result = await this._activitiesService.getActivityPlaylistId(playlistId, userId);

    if (result.length !== 0) {
      result.forEach((row) => {
        if (row.username && row.title && row.action && row.time) {
          data.activities.push({
            username: row.username,
            title: row.title,
            action: row.action,
            time: row.time,
          });
        }
      });
    }

    return data;
  }
}

module.exports = PlaylistMscService;
