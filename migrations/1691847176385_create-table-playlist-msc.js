/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlist_msc', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // add unique constraint to playlist_id and song_id column
  pgm.addConstraint('playlist_msc', 'unique_playlist_id_and_song_id', 'UNIQUE(playlist_id, song_id)');

  // add foreign key constraint for playlist_id that references to id column in playlists table
  pgm.addConstraint('playlist_msc', 'fk_playlist_msc.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');

  // add foreign key constraint for song_id that references to id column in songs table
  pgm.addConstraint('playlist_msc', 'fk_playlist_msc.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_msc');
};
