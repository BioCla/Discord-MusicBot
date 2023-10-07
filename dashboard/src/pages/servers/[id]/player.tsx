import { NextPageWithLayout } from '@/interfaces/layouts';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import NavbarIcon from '@/assets/icons/navbar-icon.svg';
import classNames from 'classnames';
import useSharedStateGetter from '@/hooks/useSharedStateGetter';
import CaretIconLeft from '@/assets/icons/caret-outline-left.svg';
import CaretIconRight from '@/assets/icons/caret-outline-right.svg';
import PlaylistBar from '@/components/PlaylistBar';
import XIcon from '@/assets/icons/x-solid.svg';
import SampleThumb from '@/assets/images/sample-thumbnail.png';
import { ISharedState } from '@/interfaces/sharedState';

const halfSeekHandlerX = 100,
    halfSeekHandlerY = 100;

const sharedStateMount = (sharedState: ISharedState) => {
    if (sharedState.navbarShow && sharedState.setNavbarShow) {
        sharedState.setNavbarShow(false);
    }
};

const sharedStateUnmount = (sharedState: ISharedState) => {
    if (!sharedState.navbarShow && sharedState.setNavbarShow) {
        sharedState.setNavbarShow(true);
    }

    if (sharedState.navbarAbsolute && sharedState.setNavbarAbsolute) {
        sharedState.setNavbarAbsolute(false);
    }
};

const Player: NextPageWithLayout = () => {
    const router = useRouter();
    const serverId = router.query.id;

    const [playlistShow, setPlaylistShow] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [maxProgressValue, setMaxProgressValue] = useState(100000);
    const [socketLoading, setSocketLoading] = useState(false);

    const toSeekProgressValue = useRef<number | undefined>();

    const sharedState = useSharedStateGetter();

    const handleSeek = () => {
        if (toSeekProgressValue.current == undefined) return;

        // !TODO: send seek event to socket

        setProgressValue(toSeekProgressValue.current);
        toSeekProgressValue.current = undefined;
    };

    const seekerMouseMoveHandler = (e: MouseEvent) => {
        const el = e.target as HTMLDivElement | null;
        const progressEl = document.getElementById('player-progress-bar');
        if (!el || !progressEl) return;

        e.preventDefault();

        setProgressValue(
            (e.clientX / progressEl.clientWidth) * maxProgressValue,
        );
    };

    const seekerMouseUpHandler = (e: MouseEvent) => {
        const el = e.target as HTMLDivElement | null;
        if (!el) return;

        e.preventDefault();

        el.removeEventListener('mousemove', seekerMouseMoveHandler);
        el.removeEventListener('mouseup', seekerMouseUpHandler);

        el.classList.remove('active');

        handleSeek();
    };

    const seekerMouseDownHandler = (e: MouseEvent) => {
        const el = document.getElementById('seek-handler');
        if (!el) return;

        e.preventDefault();

        toSeekProgressValue.current = progressValue;

        el.addEventListener('mousemove', seekerMouseMoveHandler);
        el.addEventListener('mouseup', seekerMouseUpHandler);
        el.classList.add('active');
    };

    const seekerMount = () => {
        const el = document.getElementById('seeker');

        if (!el) return;

        el.addEventListener('mousedown', seekerMouseDownHandler);
    };

    const seekerUnmount = () => {
        const el = document.getElementById('seeker');

        if (!el) return;

        el.removeEventListener('mousedown', seekerMouseDownHandler);
    };

    useEffect(() => {
        sharedStateMount(sharedState);
        seekerMount();

        return () => {
            sharedStateUnmount(sharedState);
            seekerUnmount();
        };
    }, []);

    const handleNavbarToggle = () => {
        if (!sharedState.setNavbarShow) return;
        if (!sharedState.navbarAbsolute) {
            if (!sharedState.setNavbarAbsolute) return;
            sharedState.setNavbarAbsolute(true);
        }

        sharedState.setNavbarShow((v) => !v);
    };

    const handlePlaylistToggle = () => {
        setPlaylistShow((v) => !v);
    };

    return (
        <div className="player-page-container">
            <div
                className={classNames(
                    'btn-navbar-toggle-container btn-toggle-container',
                    sharedState.navbarShow && sharedState.navbarAbsolute
                        ? 'follow-navbar'
                        : '',
                )}
            >
                <Button
                    onClick={handleNavbarToggle}
                    className={classNames('btn-navbar-toggle btn-toggle')}
                    color="default"
                >
                    {sharedState.navbarShow ? (
                        <XIcon className="x-icon" />
                    ) : (
                        <NavbarIcon className="navbar-icon" />
                    )}
                </Button>
            </div>

            <div
                className={classNames(
                    'btn-playlist-toggle-container btn-toggle-container',
                    playlistShow ? 'follow-navbar' : '',
                )}
            >
                <Button
                    onClick={handlePlaylistToggle}
                    className={classNames('btn-playlist-toggle btn-toggle')}
                    color="default"
                >
                    {playlistShow ? (
                        <CaretIconRight className="icon-right" />
                    ) : (
                        <CaretIconLeft className="icon-left" />
                    )}
                </Button>
            </div>

            <div className="main-player-content-container">
                <div className="top-container">
                    <div className="thumbnail-container">
                        <img src={SampleThumb.src} alt="Thumbnail" />
                    </div>
                    <div className="track-info-container">
                        <h1>Player {serverId}</h1>
                        <p>Player {serverId}</p>
                    </div>
                </div>

                <div className="player-control-container">
                    <div id="player-progress-bar">
                        <div
                            className="progress-value"
                            style={{
                                width: `${
                                    (progressValue / maxProgressValue) * 100
                                }%`,
                            }}
                        >
                            <div id="seeker"></div>
                        </div>

                        <div className="remaining-progress"></div>
                    </div>
                    <div
                        aria-busy={socketLoading}
                        aria-describedby="player-progress-bar"
                        className="control-duration-container"
                    >
                        <div className="control-container">
                            <div>Left</div>
                            <div>Control</div>
                            <div>Right</div>
                        </div>
                        <div className="duration-container">Duration</div>
                    </div>
                </div>
            </div>

            <PlaylistBar hide={!playlistShow} />
        </div>
    );
};

Player.getLayout = (page) => (
    <DashboardLayout
        contentContainerStyle={{
            width: '100%',
            height: '100%',
            display: 'flex',
            zIndex: 0,
            backgroundColor: 'black',
        }}
    >
        {page}
    </DashboardLayout>
);

export default Player;
