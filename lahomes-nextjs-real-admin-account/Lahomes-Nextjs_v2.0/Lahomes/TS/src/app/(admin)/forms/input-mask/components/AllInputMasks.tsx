'use client'

import Link from 'next/link'
import { Card, CardBody, CardTitle, Row, Col } from 'react-bootstrap'
import { IMaskInput } from 'react-imask'

const AllInputMasks = () => {
  return (
    <Card>
      <CardBody>
        <CardTitle as={'h5'} className="anchor" id="default">
          Input Masks
          <Link className="anchor-link" href="#default">
            #
          </Link>
        </CardTitle>
        <p className="text-muted">A Java-Script Plugin to make masks on form fields and HTML elements.</p>

        <div>
          <Row>
            {/* Left Column */}
            <Col md={6}>
              <form action="#">
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <IMaskInput
                    mask="00/00/0000"
                    placeholder="DD/MM/YYYY"
                    className="form-control"
                  />
                  <span className="fs-13 text-muted">e.g &quot;DD/MM/YYYY&quot;</span>
                  <p className="mt-1">
                    Add attribute <code>data-toggle=&quot;input-mask&quot; data-mask-format=&quot;00/00/0000&quot;</code>
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Hour</label>
                  <IMaskInput
                    mask="00:00:00"
                    placeholder="HH:MM:SS"
                    className="form-control"
                  />
                  <span className="fs-13 text-muted">e.g &quot;HH:MM:SS&quot;</span>
                  <p className="mt-1">
                    Add attribute <code>data-toggle=&quot;input-mask&quot; data-mask-format=&quot;00:00:00&quot;</code>
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Date &amp; Hour</label>
                  <IMaskInput
                    mask="00/00/0000 00:00:00"
                    placeholder="DD/MM/YYYY HH:MM:SS"
                    className="form-control"
                  />
                  <span className="fs-13 text-muted">e.g &quot;DD/MM/YYYY HH:MM:SS&quot;</span>
                  <p className="mt-1">
                    Add attribute <code>data-toggle=&quot;input-mask&quot; data-mask-format=&quot;00/00/0000 00:00:00&quot;</code>
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label">ZIP Code</label>
                  <IMaskInput mask="00000-000" placeholder="xxxxx-xxx" className="form-control" />
                  <span className="fs-13 text-muted">e.g &quot;xxxxx-xxx&quot;</span>
                  <p className="mt-1">
                    Add attribute <code>data-toggle=&quot;input-mask&quot; data-mask-format=&quot;00000-000&quot;</code>
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Crazy Zip Code</label>
                  <IMaskInput mask="0-00-00-00" placeholder="x-xx-xx-xx" className="form-control" />
                  <span className="fs-13 text-muted">e.g &quot;x-xx-xx-xx&quot;</span>
                  <p className="mt-1">
                    Add attribute <code>data-toggle=&quot;input-mask&quot; data-mask-format=&quot;0-00-00-00&quot;</code>
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Money</label>
                  <IMaskInput
                    mask={Number}
                    radix=","
                    thousandsSeparator="."
                    placeholder="0,00"
                    className="form-control"
                  />
                  <span className="fs-13 text-muted">e.g &quot;Your money&quot;</span>
                  <p className="mt-1">
                    Add attribute <code>data-mask-format=&quot;000.000.000.000.000,00&quot;</code>
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Money 2</label>
                  <IMaskInput
                    mask={Number}
                    radix=","
                    thousandsSeparator="."
                    scale={2}
                    placeholder="#.##0,00"
                    className="form-control"
                  />
                  <span className="fs-13 text-muted">e.g &quot;#.##0,00&quot;</span>
                  <p className="mt-1">
                    Add attribute <code>data-mask-format=&quot;#.##0,00&quot; data-reverse=&quot;true&quot;</code>
                  </p>
                </div>
              </form>
            </Col>

            {/* Right Column */}
            <Col md={6}>
              <form action="#">
                <div className="mb-3">
                  <label className="form-label">Telephone</label>
                  <IMaskInput mask="0000-0000" placeholder="xxxx-xxxx" className="form-control" />
                  <span className="fs-13 text-muted">e.g &quot;xxxx-xxxx&quot;</span>
                  <p className="mt-1">
                    Add attribute <code>data-toggle=&quot;input-mask&quot; data-mask-format=&quot;0000-0000&quot;</code>
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Telephone with Code Area</label>
                  <IMaskInput mask="(00) 0000-0000" placeholder="(xx) xxxx-xxxx" className="form-control" />
                  <span className="fs-13 text-muted">e.g &quot;(xx) xxxx-xxxx&quot;</span>
                  <p className="mt-1">
                    Add attribute <code>data-toggle=&quot;input-mask&quot;</code>
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label">US Telephone</label>
                  <IMaskInput mask="(000) 000-0000" placeholder="(xxx) xxx-xxxx" className="form-control" />
                  <span className="fs-13 text-muted">e.g &quot;(xxx) xxx-xxxx&quot;</span>
                  <p className="mt-1">
                    Add attribute <code>data-toggle=&quot;input-mask&quot;</code>
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label">São Paulo Celphones</label>
                  <IMaskInput mask="(00) 00000-0000" placeholder="(xx) xxxxx-xxxx" className="form-control" />
                  <span className="fs-13 text-muted">e.g &quot;(xx) xxxxx-xxxx&quot;</span>
                  <p className="mt-1">
                    Add attribute <code>data-toggle=&quot;input-mask&quot;</code>
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label">CPF</label>
                  <IMaskInput mask="000.000.000-00" placeholder="xxx.xxx.xxx-xx" className="form-control" />
                  <span className="fs-13 text-muted">e.g &quot;xxx.xxx.xxx-xx&quot;</span>
                  <p className="mt-1">
                    Add attribute <code>data-mask-format=&quot;000.000.000-00&quot; data-reverse=&quot;true&quot;</code>
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label">CNPJ</label>
                  <IMaskInput mask="00.000.000/0000-00" placeholder="xx.xxx.xxx/xxxx-xx" className="form-control" />
                  <span className="fs-13 text-muted">e.g &quot;xx.xxx.xxx/xxxx-xx&quot;</span>
                  <p className="mt-1">
                    Add attribute <code>data-mask-format=&quot;00.000.000/0000-00&quot; data-reverse=&quot;true&quot;</code>
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label">IP Address</label>
                  <IMaskInput mask="099.099.099.099" placeholder="xxx.xxx.xxx.xxx" className="form-control" />
                  <span className="fs-13 text-muted">e.g &quot;xxx.xxx.xxx.xxx&quot;</span>
                  <p className="mt-1">
                    Add attribute <code>data-mask-format=&quot;099.099.099.099&quot; data-reverse=&quot;true&quot;</code>
                  </p>
                </div>
              </form>
            </Col>
          </Row>
        </div>
      </CardBody>
    </Card>
  )
}

export default AllInputMasks
