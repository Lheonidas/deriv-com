import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Cookies from 'js-cookie'
import { isEuCountry } from 'common/country-base'
import { BinarySocketBase } from 'common/websocket/socket_base'
import { size } from 'themes/device.js'

const handleEu = (setVisible, to) => is_eu_country => {
    switch (to) {
        case 'eu':
            setVisible(is_eu_country)
            break
        case 'non-eu':
            setVisible(!is_eu_country)
            break
        case 'global':
            setVisible(true)
            break
        default:
            break
    }
}

const Show = ({ children, to='global', device }) => {
    const [visible, setVisible] = useState(false)
    const [deviceVisibility, setdeviceVisibility] = useState(true)
    useEffect(() => {
        if (to) {
            const clients_country = Cookies.get('clients_country')
            const showEu = handleEu(setVisible, to)
            if (clients_country) {
                isEuCountry(clients_country)
                showEu(isEuCountry(clients_country))
            } else {
                BinarySocketBase.wait('website_status').then(response => {
                    showEu(isEuCountry(response.website_status.clients_country))

                    /* country_code cookies will be valid for 1 month */
                    Cookies.set(
                        'clients_country',
                        response.website_status.clients_country,
                        { expires: 30 },
                    )
                })
            }
        }
        if (device) {
            switch (device) {
                case 'laptop':
                    setdeviceVisibility(
                        window.innerWidth > size.tabletL.slice(0, -2),
                    )
                    break
                case 'mobile':
                    setdeviceVisibility(
                        window.innerWidth < size.tabletL.slice(0, -2),
                    )
                    break
                default:
                    break
            }
        }
    })
    return visible && deviceVisibility ? <>{children}</> : null
}

Show.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
    device: PropTypes.oneOf(['mobile', 'laptop']),
    to: PropTypes.oneOf(['eu', 'non-eu']),
}
export default Show
