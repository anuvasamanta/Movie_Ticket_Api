const MovieModel = require("../model/movieModel")
const StatusCode = require("../helper/statusCode")
const TheaterModel = require("../model/theatherModel")
class AdminController {

    async checkAuthAdmin(req, res, next) {
        try {
            if (req.admin) {
                next()
            } else {
                res.redirect('/login/user')
            }

        } catch (error) {
            console.log(error);

        }

    }

    // create movie
    async createMovie(req, res) {
        try {
            const { Movie_name, genre, language, duration, cast, director, releaseDate } = req.body;
            const movie = new MovieModel({
                Movie_name,
                genre,
                language,
                duration,
                cast,
                director,
                releaseDate
            });
            const movies = await movie.save();
            return res.status(StatusCode.CREATED).json({ message: 'Movie created successfully', Movie: movies });
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.BAD_REQUEST).json({ message: 'Internal server error' });
        }
    }

    // create theather
    async addTheater(req, res) {
        try {
            const { Theater_name, location, screens } = req.body;
            const theater = new TheaterModel({
                Theater_name,
                location,
                screens
            });
            await theater.save();
            return res.status(201).json({ message: 'Theater added successfully', theater });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    // assign theather to movie
    async assignTheather(req, res) {
        try {
            const { theaterId, screenNumber, movieId, showTimings } = req.body;
            const theater = await TheaterModel.findById(theaterId);
            if (!theater) {
                return res.status(404).json({ message: 'Theater not found' });
            }
            const screen = theater.screens.find(screen => screen.number === screenNumber);
            if (!screen) {
                return res.status(404).json({ message: 'Screen not found' });
            }
            screen.movies.push({ movieId, showTimings });
            await theater.save();
            return res.status(200).json({ message: 'Movie assigned to theater successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // List of movies
    async movieList(req, res) {
        try {
            const movies = await MovieModel.aggregate([
                {
                    $lookup: {
                        from: 'theaters',
                        localField: '_id',
                        foreignField: 'screens.movies.movieId',
                        as: 'theaters'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        Movie_name: 1,
                        totalTheaters: { $size: '$theaters' },
                        theaters: {
                            $map: {
                                input: '$theaters',
                                as: 'theater',
                                in: {
                                    theaterId: '$$theater._id',
                                    Theater_name: '$$theater.Theater_name',
                                    location: '$$theater.location',
                                    screens: {
                                        $map: {
                                            input: '$$theater.screens',
                                            as: 'screen',
                                            in: {
                                                screenNumber: '$$screen.number',
                                                showTimings: {
                                                    $map: {
                                                        input: '$$screen.movies',
                                                        as: 'movie',
                                                        in: {
                                                            movieId: '$$movie.movieId',
                                                            showTimings: '$$movie.showTimings'
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            ]);

            return res.status(200).json(movies);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // edit movie details
    async updateMovie(req, res) {
        try {
            const { id } = req.params;
            const { Movie_name, genre, language, duration, cast, director, releaseDate } = req.body;
            const movie = await MovieModel.findByIdAndUpdate(id, {
                Movie_name,
                genre,
                language,
                duration,
                cast,
                director,
                releaseDate
            }, { new: true });
            if (!movie) {
                return res.status(404).json({ message: 'Movie not found' });
            }
            return res.status(200).json({ message: 'Movie updated successfully', movie });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Delete Movie
    async deleteMovie(req, res) {
        try {
            const { id } = req.params;
            const movie = await MovieModel.findByIdAndDelete(id);
            if (!movie) {
                return res.status(404).json({ message: 'Movie not found' });
            }
            // Remove movie from theaters
            await TheaterModel.updateMany({}, { $pull: { 'screens.$[].movies': { movieId: id } } });
            return res.status(200).json({ message: 'Movie deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // logout Admin
    async logoutAdmin(req, res) {
        try {
            res.clearCookie('adminToken')
            return res.status(StatusCode.CREATED).json({
                message: "Admin Logout Successfully!"
            })

        } catch (error) {
            return res.status(401).json({ message: "Internal Server Error" })
        }
    }

}


module.exports = new AdminController()